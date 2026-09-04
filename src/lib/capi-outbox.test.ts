import assert from "node:assert/strict";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import {
  CAPI_DRAIN_LEASE_MS,
  countRecoverableEvents,
  decideRetry,
  drainCapiOutbox,
  purgeExpiredCapiOutboxEvents,
  requeueRecoverableEvents,
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
          return { results: sql.includes("RETURNING id, event_id") ? [retryRow()] : [] };
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
  // The claim is itself an UPDATE now, so the two statements are told apart by
  // what they do rather than by their verb.
  const claim = seen.find((sql) => sql.includes("RETURNING id, event_id")) || "";
  const settle = seen.find((sql) => sql.includes("attempts + 1 >= max_attempts")) || "";
  assert.doesNotMatch(claim, /attempts\s*<\s*max_attempts/);
  assert.match(settle, /attempts \+ 1 >= max_attempts/);
  assert.match(claim, /'Purchase' THEN 0/);
  // Claim before send: the row leaves the due window before any network call,
  // which is the whole point.
  assert.match(claim, /SET next_retry_at = \?/);
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
          return { results: sql.includes("RETURNING id, event_id") ? [retryRow()] : [] };
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
  // This is the invariant `requeueRecoverableEvents` selects on. If a third
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


function outboxDatabase(seed: string) {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(`
    CREATE TABLE capi_event_outbox (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id TEXT NOT NULL UNIQUE, event_name TEXT NOT NULL, payload TEXT NOT NULL,
      status TEXT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0,
      max_attempts INTEGER NOT NULL DEFAULT 5, last_error TEXT,
      next_retry_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    ${seed}
  `);
  const database = {
    prepare: (sql: string) => {
      const bound: unknown[] = [];
      const statement = {
        bind: (...values: unknown[]) => { bound.push(...values); return statement; },
        run: async () => ({ meta: { changes: Number(sqlite.prepare(sql).run(...bound as never[]).changes) } }),
        first: async () => sqlite.prepare(sql).get(...bound as never[]) ?? null,
        all: async () => ({ results: sqlite.prepare(sql).all(...bound as never[]) }),
      };
      return statement;
    },
  } as unknown as D1Database;
  return { sqlite, database };
}

test("requeue recovers a destination outage, not just a dead token", async () => {
  const now = new Date("2026-09-04T04:00:00.000Z");
  const { sqlite, database } = outboxDatabase(`
    INSERT INTO capi_event_outbox VALUES
      -- exhausted its budget honestly, against a pixel the token could not see
      (1,'vc-1','ViewContent','{}','failed',5,5,'Unsupported post request. Object with ID ...','t','2026-09-03T12:14:00.000Z','t'),
      -- the dead-token rows the first version of this function was built for
      (2,'pv-1','PageView','{}','failed',2,5,'Error validating access token','t','2026-09-03T09:00:00.000Z','t'),
      -- Purchase, and it must be requeued ahead of the rest
      (3,'INV-9','Purchase','{}','failed',9,5,'Unsupported post request. Object with ID ...','t','2026-09-03T13:00:00.000Z','t'),
      -- can never succeed
      (4,'bad-1','PageView','{}','failed',0,5,'payload tidak dapat dibaca','t','2026-09-03T13:00:00.000Z','t'),
      -- inside the 30-day retention, past Meta's 7-day event_time limit
      (5,'old-1','PageView','{}','failed',5,5,'Unsupported post request. Object with ID ...','t','2026-08-20T00:00:00.000Z','t'),
      -- already delivered
      (6,'pv-2','PageView','{}','sent',1,5,NULL,'t','2026-09-03T13:00:00.000Z','t');
  `);

  assert.equal(await countRecoverableEvents(database, now), 3);
  assert.equal(await requeueRecoverableEvents(database, now), 3);

  const rows = sqlite.prepare("SELECT event_id, status, attempts, last_error FROM capi_event_outbox ORDER BY id").all() as {
    event_id: string; status: string; attempts: number; last_error: string | null;
  }[];
  assert.deepEqual(
    rows.map((r) => `${r.event_id}:${r.status}:${r.attempts}`),
    // Budget reset, error cleared. The unreadable payload and the stale row
    // stay terminal; sending either would spend the operator's one recovery on
    // an event that can never land.
    ["vc-1:pending:0", "pv-1:pending:0", "INV-9:pending:0", "bad-1:failed:0", "old-1:failed:5", "pv-2:sent:1"],
  );
  assert.equal(rows[0].last_error, null);
  assert.equal(await countRecoverableEvents(database, now), 0, "requeue does not loop");
});

test("two concurrent drains never claim the same row", async () => {
  const now = new Date("2026-09-04T04:00:00.000Z");
  const payloadFor = (eventId: string) =>
    JSON.stringify({
      eventName: "PageView",
      eventId,
      eventSourceUrl: "https://toko.test/",
      userData: {},
      customData: {},
    });
  const seeded = Array.from({ length: 14 }, (_, i) =>
    `(${i + 1},'e-${i + 1}','PageView','${payloadFor(`e-${i + 1}`)}','pending',0,5,NULL,'2026-09-04T03:00:00.000Z','2026-09-04T03:00:00.000Z','t')`,
  ).join(",");
  const { sqlite, database } = outboxDatabase(`INSERT INTO capi_event_outbox VALUES ${seeded};`);

  const transmitted: string[] = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => {
    // Slow enough that a second drain would overlap a naive select-then-send.
    await new Promise((resolve) => setTimeout(resolve, 5));
    return new Response(JSON.stringify({ events_received: 1 }), { status: 200 });
  }) as typeof fetch;
  try {
    // Both drains claim before either transmits — the shape two visitors
    // arriving together produce, each firing a drain in `waitUntil`.
    await Promise.all([
      drainCapiOutbox(database, "1234567890", "token", now),
      drainCapiOutbox(database, "1234567890", "token", now),
    ]);
  } finally {
    globalThis.fetch = originalFetch;
  }

  const sent = sqlite.prepare("SELECT event_id FROM capi_event_outbox WHERE status = 'sent' ORDER BY id").all() as { event_id: string }[];
  transmitted.push(...sent.map((row) => row.event_id));
  // Ten claimed by the first drain, four by the second: disjoint, and every
  // one of the fourteen accounted for exactly once.
  assert.equal(new Set(transmitted).size, transmitted.length, "no row may be claimed twice");
  assert.equal(transmitted.length, 14);

  const overBudget = sqlite
    .prepare("SELECT COUNT(*) AS c FROM capi_event_outbox WHERE attempts > max_attempts")
    .get() as { c: number };
  assert.equal(overBudget.c, 0, "a double transmission is what pushed attempts past its budget in production");
});

test("a claimed row is hidden from the next drain until its lease expires", async () => {
  const now = new Date("2026-09-04T04:00:00.000Z");
  const { sqlite, database } = outboxDatabase(`
    INSERT INTO capi_event_outbox VALUES
      (1,'e-1','PageView','{"eventName":"PageView","eventId":"e-1","eventSourceUrl":"https://toko.test/","userData":{},"customData":{}}','pending',0,5,NULL,'2026-09-04T03:00:00.000Z','2026-09-04T03:00:00.000Z','t');
  `);
  const originalFetch = globalThis.fetch;
  // A transmission that never resolves is a Worker killed mid-drain.
  globalThis.fetch = (async () => new Promise(() => {})) as typeof fetch;
  try {
    void drainCapiOutbox(database, "1234567890", "token", now);
    await new Promise((resolve) => setTimeout(resolve, 10));
    const leased = sqlite.prepare("SELECT next_retry_at FROM capi_event_outbox WHERE id = 1").get() as { next_retry_at: string };
    assert.ok(
      Date.parse(leased.next_retry_at) > now.getTime(),
      "the claim must push the row out of the due window",
    );
    // The lease is a delay, not a grave: the row returns on its own.
    assert.ok(
      Date.parse(leased.next_retry_at) <= now.getTime() + CAPI_DRAIN_LEASE_MS,
      "and it must come back once the lease expires",
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
