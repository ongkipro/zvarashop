import { sendMetaCapiEvent, type MetaCustomData, type MetaUserData } from "./meta-capi.ts";

/**
 * Transactional outbox for Meta CAPI.
 *
 * A conversion event is recorded in D1 *before* it is transmitted, so a network
 * blip, a Meta 429, or an expired token cannot silently discard revenue signal.
 * Failed events retry with exponential backoff, drained opportunistically by
 * later storefront traffic — no cron trigger or queue binding required, which
 * matters because the Astro Cloudflare adapter owns the Worker entrypoint.
 */

export type OutboxEvent = {
  eventName: string;
  eventId: string;
  eventSourceUrl: string;
  userData: MetaUserData;
  customData: MetaCustomData;
  /** Unix seconds stamped at enqueue; optional for older stored payloads. */
  eventTime?: number;
};

type OutboxRow = {
  id: number;
  event_id: string;
  event_name: string;
  payload: string;
  attempts: number;
  max_attempts: number;
  created_at: string;
};

/** Meta error codes: 4/17/613 are rate limits, 190 means the token is dead. */
const RATE_LIMIT_CODES = new Set([4, 17, 613]);
const INVALID_TOKEN_CODE = 190;
const MAX_DRAIN_BATCH = 10;

export type RetryDecision = {
  status: "sent" | "pending" | "failed";
  delayMs: number;
};

/**
 * Pure so the backoff ladder is testable without a database or a live Meta.
 * Rate limits wait a flat 15 minutes; everything else doubles from two minutes
 * and caps at an hour. A dead token is terminal — retrying only burns quota.
 */
export function decideRetry(
  outcome: { success: boolean; errorCode?: number },
  attempts: number,
  maxAttempts: number,
): RetryDecision {
  if (outcome.success) return { status: "sent", delayMs: 0 };

  const nextAttempt = attempts + 1;
  if (outcome.errorCode === INVALID_TOKEN_CODE || nextAttempt >= maxAttempts) {
    return { status: "failed", delayMs: 0 };
  }
  const delayMs = RATE_LIMIT_CODES.has(outcome.errorCode ?? -1)
    ? 15 * 60_000
    : Math.min(2 ** nextAttempt, 60) * 60_000;
  return { status: "pending", delayMs };
}

function readErrorCode(response: unknown): number | undefined {
  const error = (response as { error?: { code?: unknown } } | null)?.error;
  return typeof error?.code === "number" ? error.code : undefined;
}

/**
 * Records the event as pending. Returns false when `eventId` is already known,
 * which makes a replayed browser request a no-op instead of a duplicate
 * conversion — the same guarantee `event_id` gives inside Meta, one layer up.
 */
export async function enqueueCapiEvent(
  database: D1Database,
  event: OutboxEvent,
): Promise<boolean> {
  const now = new Date().toISOString();
  const stamped: OutboxEvent = {
    ...event,
    eventTime: event.eventTime ?? Math.floor(Date.now() / 1000),
  };
  const result = await database
    .prepare(
      `INSERT OR IGNORE INTO capi_event_outbox
         (event_id, event_name, payload, status, next_retry_at, created_at, updated_at)
       VALUES (?, ?, ?, 'pending', ?, ?, ?)`,
    )
    .bind(event.eventId, event.eventName, JSON.stringify(stamped), now, now, now)
    .run();
  return Boolean(result.meta?.changes);
}

async function transmit(
  database: D1Database,
  row: OutboxRow,
  pixelId: string,
  accessToken: string,
) {
  let event: OutboxEvent;
  try {
    event = JSON.parse(row.payload) as OutboxEvent;
  } catch {
    // Unparseable payloads can never succeed; retrying them is pure waste.
    await database
      .prepare(
        `UPDATE capi_event_outbox
         SET status = 'failed', last_error = 'payload tidak dapat dibaca', updated_at = ?
         WHERE id = ?`,
      )
      .bind(new Date().toISOString(), row.id)
      .run();
    return false;
  }

  const result = await sendMetaCapiEvent(
    event.eventName,
    event.eventId,
    event.eventSourceUrl,
    event.userData,
    event.customData,
    pixelId,
    accessToken,
    undefined,
    event.eventTime ?? Math.floor(new Date(row.created_at).getTime() / 1000),
  );

  const decision = decideRetry(
    { success: result.success, errorCode: readErrorCode(result.response) },
    row.attempts,
    row.max_attempts,
  );
  const now = Date.now();

  await database
    .prepare(
      `UPDATE capi_event_outbox
       SET status = CASE
             WHEN ? = 'sent' THEN 'sent'
             WHEN attempts + 1 >= max_attempts THEN 'failed'
             ELSE ?
           END,
           attempts = attempts + ?, last_error = ?, next_retry_at = ?, updated_at = ?
       WHERE id = ?`,
    )
    .bind(
      decision.status,
      decision.status,
      decision.status === "sent" ? 0 : 1,
      decision.status === "sent" ? null : (result.reason ?? "unknown"),
      new Date(now + decision.delayMs).toISOString(),
      new Date(now).toISOString(),
      row.id,
    )
    .run();

  return decision.status === "sent";
}

/**
 * Longest delay `decideRetry` can ever schedule. A `pending` event whose
 * `next_retry_at` has passed by more than this is not merely waiting its turn —
 * nothing is draining it.
 */
export const CAPI_MAX_BACKOFF_MS = 60 * 60_000;

/** Rows inspected by the bounded delivery-window read below. */
export const CAPI_DELIVERY_WINDOW = 200;

export type CapiOutboxDepth = {
  /** Enqueued, not yet delivered, still inside its retry budget. */
  pending: number;
  /** Terminally undeliverable — a dead token or an exhausted attempt budget. */
  failed: number;
  /** Subset of `pending` whose `next_retry_at` is already in the past. */
  overdue: number;
  /** `created_at` of the oldest undelivered row, or null when there are none. */
  oldestCreatedAt: string | null;
};

export type CapiDeliveryWindow = {
  rowsScanned: number;
  lastDeliveredAt: string | null;
  lastFailedAt: string | null;
};

type DepthRow = {
  pending: number | null;
  failed: number | null;
  overdue: number | null;
  oldest_created_at: string | null;
};

const count = (value: number | null | undefined) =>
  Number.isFinite(Number(value)) ? Number(value) : 0;

/**
 * How much conversion signal is owed to Meta right now.
 *
 * One statement. `status IN ('pending','failed')` is served by
 * `capi_event_outbox_due_idx (status, next_retry_at)` as two equality probes,
 * so the rows read are the *undelivered* rows only — near zero on a healthy
 * install, and proportional to the backlog exactly when the backlog is the
 * thing being asked about. Delivered rows are never touched.
 *
 * Returns null when the table cannot be read, which the caller must report as
 * "unknown" rather than as a depth of zero.
 */
export async function readCapiOutboxDepth(
  database: D1Database,
): Promise<CapiOutboxDepth | null> {
  try {
    const row = await database
      .prepare(
        `SELECT
           SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
           SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) AS failed,
           SUM(CASE WHEN status = 'pending' AND next_retry_at <= ? THEN 1 ELSE 0 END) AS overdue,
           MIN(CASE WHEN status IN ('pending', 'failed') THEN created_at END) AS oldest_created_at
         FROM capi_event_outbox
         WHERE status IN ('pending', 'failed')`,
      )
      .bind(new Date().toISOString())
      .first<DepthRow>();
    return {
      pending: count(row?.pending),
      failed: count(row?.failed),
      overdue: count(row?.overdue),
      oldestCreatedAt: row?.oldest_created_at ?? null,
    };
  } catch (error) {
    console.error("capi-outbox-depth-unreadable", error);
    return null;
  }
}

/**
 * When Meta last accepted an event, and when one last failed.
 *
 * lazy: bounded reverse-rowid scan of the newest `CAPI_DELIVERY_WINDOW` rows
 * rather than `MAX(updated_at) WHERE status = 'sent'`, which would read every
 * delivered row on every dashboard refresh — nothing indexes `updated_at` and
 * the outbox is never pruned. Ceiling: a delivery older than the last 200
 * events reads as "none recorded", which on a store still sending conversions
 * is itself the answer. Upgrade path: add `(status, updated_at)` in a forward
 * migration and drop the window.
 */
export async function readCapiDeliveryWindow(
  database: D1Database,
): Promise<CapiDeliveryWindow | null> {
  try {
    const row = await database
      .prepare(
        `SELECT
           COUNT(*) AS rows_scanned,
           MAX(CASE WHEN status = 'sent' THEN updated_at END) AS last_delivered_at,
           MAX(CASE WHEN status = 'failed' THEN updated_at END) AS last_failed_at
         FROM (
           SELECT status, updated_at FROM capi_event_outbox ORDER BY id DESC LIMIT ?
         )`,
      )
      .bind(CAPI_DELIVERY_WINDOW)
      .first<{
        rows_scanned: number | null;
        last_delivered_at: string | null;
        last_failed_at: string | null;
      }>();
    return {
      rowsScanned: count(row?.rows_scanned),
      lastDeliveredAt: row?.last_delivered_at ?? null,
      lastFailedAt: row?.last_failed_at ?? null,
    };
  } catch (error) {
    console.error("capi-outbox-delivery-window-unreadable", error);
    return null;
  }
}

/** Sends one already-enqueued event immediately. */
export async function deliverCapiEvent(
  database: D1Database,
  eventId: string,
  pixelId: string,
  accessToken: string,
) {
  const row = await database
    .prepare(
      `SELECT id, event_id, event_name, payload, attempts, max_attempts, created_at
       FROM capi_event_outbox WHERE event_id = ? AND status = 'pending' LIMIT 1`,
    )
    .bind(eventId)
    .first<OutboxRow>();
  if (!row) return false;
  return transmit(database, row, pixelId, accessToken);
}

/**
 * Retries events whose backoff has elapsed. Bounded per call so a burst of
 * failures cannot turn one storefront request into a long-running drain.
 */
export async function drainCapiOutbox(
  database: D1Database,
  pixelId: string,
  accessToken: string,
): Promise<number> {
  const due = await database
    .prepare(
      `SELECT id, event_id, event_name, payload, attempts, max_attempts, created_at
       FROM capi_event_outbox
       WHERE status = 'pending' AND next_retry_at <= ?
       ORDER BY CASE WHEN event_name = 'Purchase' THEN 0 ELSE 1 END, id ASC
       LIMIT ?`,
    )
    .bind(new Date().toISOString(), MAX_DRAIN_BATCH)
    .all<OutboxRow>();

  let sent = 0;
  for (const row of due.results ?? []) {
    if (await transmit(database, row, pixelId, accessToken)) sent += 1;
  }
  return sent;
}

/**
 * Rows a dead access token killed, offered back once a live one is saved.
 *
 * `decideRetry` makes error 190 terminal immediately, which is right —
 * retrying a dead token only burns quota — but it also means every event that
 * arrived during the outage is lost the moment the operator fixes the
 * credential. One live install carried 33 such rows.
 *
 * They are identified structurally rather than by parsing Meta's error prose,
 * which is not a contract and would silently stop matching if Meta reworded
 * it. `decideRetry` terminates for exactly two reasons: a dead token, or an
 * exhausted attempt budget. So `status = 'failed' AND attempts < max_attempts`
 * is precisely the token case — and it classifies rows recorded before this
 * function existed, which a new error-code column could not. The one other
 * writer of `failed` is `transmit`'s unparseable-payload branch, which leaves
 * `attempts` untouched; it is excluded by its own `last_error` because
 * requeueing a payload that can never be read is pure waste.
 *
 * This is deliberately not automatic. Resending conversions is an outbound
 * action with a real advertising consequence, so it stays an explicit operator
 * decision. Requeued rows keep their original `event_id` and stored
 * `eventTime`, so Meta still deduplicates them against anything already
 * delivered and a Purchase is still attributed to when it happened.
 */
export async function requeueInvalidTokenEvents(
  database: D1Database,
  limit = 200,
): Promise<number> {
  const bounded = Math.max(1, Math.min(1000, Math.trunc(limit) || 200));
  const now = new Date().toISOString();
  const result = await database
    .prepare(
      `UPDATE capi_event_outbox
          SET status = 'pending', attempts = 0, last_error = NULL,
              next_retry_at = ?, updated_at = ?
        WHERE id IN (
          SELECT id FROM capi_event_outbox
           WHERE status = 'failed'
             AND attempts < max_attempts
             AND COALESCE(last_error, '') <> 'payload tidak dapat dibaca'
           ORDER BY CASE WHEN event_name = 'Purchase' THEN 0 ELSE 1 END, id ASC
           LIMIT ?
        )`,
    )
    .bind(now, now, bounded)
    .run();
  return Number(result.meta?.changes || 0);
}

/** How many rows `requeueInvalidTokenEvents` would move right now. */
export async function countInvalidTokenEvents(
  database: D1Database,
): Promise<number> {
  const row = await database
    .prepare(
      `SELECT COUNT(*) AS recoverable
         FROM capi_event_outbox
        WHERE status = 'failed'
          AND attempts < max_attempts
          AND COALESCE(last_error, '') <> 'payload tidak dapat dibaca'`,
    )
    .first<{ recoverable: number }>();
  return Number(row?.recoverable || 0);
}

const OUTBOX_RETENTION_DAYS = 30;

export async function purgeExpiredCapiOutboxEvents(
  database: D1Database,
  now = new Date(),
) {
  const result = await database.prepare(
    `DELETE FROM capi_event_outbox
      WHERE status IN ('sent', 'failed')
        AND unixepoch(updated_at) < unixepoch(?, '-${OUTBOX_RETENTION_DAYS} days')`,
  ).bind(now.toISOString()).run();
  return result.meta.changes;
}
