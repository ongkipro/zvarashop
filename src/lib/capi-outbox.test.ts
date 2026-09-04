import assert from "node:assert/strict";
import test from "node:test";
import {
  countInvalidTokenEvents,
  decideRetry,
  drainCapiOutbox,
  purgeExpiredCapiOutboxEvents,
  requeueInvalidTokenEvents,
} from "./capi-outbox.ts";

const MINUTE = 60_000;

test("a delivered event is settled and never retried", () => {
  assert.deepEqual(decideRetry({ success: true }, 0, 5), { status: "sent", delayMs: 0 });
});

test("transient failures back off exponentially instead of hammering Meta", () => {
  assert.deepEqual(decideRetry({ success: false }, 0, 5), { status: "pending", delayMs: 2 * MINUTE });
  assert.deepEqual(decideRetry({ success: false }, 1, 5), { status: "pending", delayMs: 4 * MINUTE });
  assert.deepEqual(decideRetry({ success: false }, 2, 5), { status: "pending", delayMs: 8 * MINUTE });
});

test("rate limits wait a flat window rather than doubling", () => {
  for (const code of [4, 17, 613]) {
    assert.deepEqual(decideRetry({ success: false, errorCode: code }, 1, 5), {
      status: "pending",
      delayMs: 15 * MINUTE,
    });
  }
});

test("a dead access token is terminal — retrying only burns quota", () => {
  assert.equal(decideRetry({ success: false, errorCode: 190 }, 0, 5).status, "failed");
});

test("events stop retrying once the attempt budget is spent", () => {
  assert.equal(decideRetry({ success: false }, 4, 5).status, "failed");
  assert.equal(decideRetry({ success: false }, 3, 5).status, "pending");
});

test("backoff is capped so a stale event cannot schedule itself years out", () => {
  assert.equal(decideRetry({ success: false }, 20, 50).delayMs, 60 * MINUTE);
});

function retryRow(payload: Record<string, unknown> = {}) {
  return {
    id: 1,
    event_id: "INV-10011",
    event_name: "Purchase",
    payload: JSON.stringify({
      eventName: "Purchase",
      eventId: "INV-10011",
      eventSourceUrl: "https://example.test/thanks",
      userData: {},
      customData: { orderNumber: "INV-10011" },
      ...payload,
    }),
    attempts: 5,
    max_attempts: 5,
    created_at: "2026-08-29T07:43:27.234Z",
  };
}

test("an over-budget row is still drained and terminal state is rechecked in SQL", async () => {
  const seen: string[] = [];
  const database = {
    prepare(sql: string) {
      seen.push(sql);
      const statement = {
        bind: () => statement,
        async all() {
          return { results: sql.includes("SELECT id, event_id") ? [retryRow()] : [] };
        },
        async run() {
          return { meta: { changes: 1 } };
        },
      };
      return statement;
    },
  } as unknown as D1Database;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response('{"events_received":1}', { status: 200 });
  try {
    await drainCapiOutbox(database, "111", "token");
  } finally {
    globalThis.fetch = originalFetch;
  }
  const select = seen.find((sql) => sql.includes("SELECT id, event_id")) || "";
  const update = seen.find((sql) => sql.includes("UPDATE capi_event_outbox")) || "";
  assert.doesNotMatch(select, /attempts\s*<\s*max_attempts/);
  assert.match(update, /attempts \+ 1 >= max_attempts/);
  assert.match(select, /'Purchase' THEN 0/);
});

test("a retry preserves when the event happened", async () => {
  const createdAt = "2026-08-29T07:43:27.234Z";
  const happenedAt = Math.floor(new Date(createdAt).getTime() / 1000);
  let sentBody: { data: Array<{ event_time: number }> } | null = null;
  const database = {
    prepare(sql: string) {
      const statement = {
        bind: () => statement,
        async all() {
          return { results: sql.includes("SELECT id, event_id") ? [retryRow()] : [] };
        },
        async run() {
          return { meta: { changes: 1 } };
        },
      };
      return statement;
    },
  } as unknown as D1Database;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (_input, init) => {
    sentBody = JSON.parse(String(init?.body));
    return new Response('{"events_received":1}', { status: 200 });
  };
  try {
    await drainCapiOutbox(database, "111", "token");
  } finally {
    globalThis.fetch = originalFetch;
  }
  assert.ok(sentBody);
  assert.equal(
    (sentBody as { data: Array<{ event_time: number }> }).data[0].event_time,
    happenedAt,
  );
});

test("terminal CAPI outbox rows have bounded retention", async () => {
  let sql = "";
  let bound = "";
  const database = {
    prepare(nextSql: string) {
      sql = nextSql;
      const statement = {
        bind(value: string) {
          bound = value;
          return statement;
        },
        async run() {
          return { meta: { changes: 7 } };
        },
      };
      return statement;
    },
  } as unknown as D1Database;
  const removed = await purgeExpiredCapiOutboxEvents(
    database,
    new Date("2026-09-01T00:00:00.000Z"),
  );
  assert.equal(removed, 7);
  assert.match(sql, /status IN \('sent', 'failed'\)/);
  assert.match(sql, /-30 days/);
  assert.equal(bound, "2026-09-01T00:00:00.000Z");
});

// Recovering an outage caused by a dead access token. The classification is
// structural rather than a match on Meta's error prose, so it must stay
// pinned to the one property that makes it exact.

test("a dead token is the only reason decideRetry terminates below the attempt budget", () => {
  // This is the invariant `requeueInvalidTokenEvents` selects on. If a third
  // terminal reason is ever added without incrementing attempts, that reason
  // would silently become "recoverable" and be resent forever.
  assert.deepEqual(decideRetry({ success: false, errorCode: 190 }, 0, 5), {
    status: "failed",
    delayMs: 0,
  });
  assert.equal(decideRetry({ success: false, errorCode: 500 }, 0, 5).status, "pending");
  assert.equal(decideRetry({ success: false, errorCode: 4 }, 0, 5).status, "pending");
  assert.equal(decideRetry({ success: false, errorCode: 500 }, 4, 5).status, "failed");
});

test("requeue moves token failures, leaves exhausted and unreadable rows alone", async () => {
  const { DatabaseSync } = await import("node:sqlite");
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(`
    CREATE TABLE capi_event_outbox (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id TEXT NOT NULL UNIQUE, event_name TEXT NOT NULL, payload TEXT NOT NULL,
      status TEXT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0,
      max_attempts INTEGER NOT NULL DEFAULT 5, last_error TEXT,
      next_retry_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    INSERT INTO capi_event_outbox VALUES
      (1,'INV-1','Purchase','{}','failed',1,5,'Error validating access token','t','t','t'),
      (2,'pv-1','PageView','{}','failed',1,5,'Error validating access token','t','t','t'),
      (3,'vc-1','ViewContent','{}','failed',5,5,'Meta CAPI HTTP 400','t','t','t'),
      (4,'bad-1','PageView','{}','failed',0,5,'payload tidak dapat dibaca','t','t','t'),
      (5,'pv-2','PageView','{}','sent',1,5,NULL,'t','t','t');
  `);
  const database = {
    prepare: (sql: string) => {
      const bound: unknown[] = [];
      const statement = {
        bind: (...values: unknown[]) => { bound.push(...values); return statement; },
        run: async () => ({ meta: { changes: Number(sqlite.prepare(sql).run(...bound as never[]).changes) } }),
        first: async () => sqlite.prepare(sql).get(...bound as never[]) ?? null,
      };
      return statement;
    },
  } as unknown as D1Database;

  assert.equal(await countInvalidTokenEvents(database), 2);
  assert.equal(await requeueInvalidTokenEvents(database), 2);

  const rows = sqlite.prepare("SELECT event_id, status, attempts FROM capi_event_outbox ORDER BY id").all() as {
    event_id: string; status: string; attempts: number;
  }[];
  assert.deepEqual(
    rows.map((row) => `${row.event_id}:${row.status}:${row.attempts}`),
    // The exhausted row and the unreadable payload stay terminal; retrying
    // either is pure waste. The delivered row is untouched.
    ["INV-1:pending:0", "pv-1:pending:0", "vc-1:failed:5", "bad-1:failed:0", "pv-2:sent:1"],
  );
  assert.equal(await countInvalidTokenEvents(database), 0, "requeue is not repeatable into a loop");
});
