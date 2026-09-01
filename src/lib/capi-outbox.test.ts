import assert from "node:assert/strict";
import test from "node:test";
import {
  decideRetry,
  drainCapiOutbox,
  purgeExpiredCapiOutboxEvents,
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
