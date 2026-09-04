import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import test, { afterEach, beforeEach } from "node:test";
import { POST } from "../pages/api/meta-event.ts";

/**
 * The `country` match key, end to end into the outbox payload.
 *
 * `meta-event.ts` carries every first-party PageView, ViewContent and
 * `/thanks` Purchase. It validated `country`, and built `user_data` without
 * it — so the Pixel leg of a Purchase described the buyer with a country and
 * the CAPI leg of the same Purchase did not, on the same order. The headless
 * route had always forwarded it, which is what made the asymmetry invisible.
 *
 * Asserted against the row the outbox actually stores, because that payload is
 * what is transmitted; a test of the validator alone passed throughout the bug.
 */

type QueryValue = null | number | string;

class Statement {
  readonly sqlite: DatabaseSync;
  readonly sql: string;
  readonly values: QueryValue[];
  constructor(sqlite: DatabaseSync, sql: string, values: QueryValue[] = []) {
    this.sqlite = sqlite;
    this.sql = sql;
    this.values = values;
  }
  bind(...values: QueryValue[]) {
    return new Statement(this.sqlite, this.sql, values);
  }
  async first<T>() {
    return (this.sqlite.prepare(this.sql).get(...this.values) ?? null) as T | null;
  }
  async all<T>() {
    return { results: this.sqlite.prepare(this.sql).all(...this.values) as T[] };
  }
  async run() {
    const result = this.sqlite.prepare(this.sql).run(...this.values);
    return { success: true, meta: { changes: Number(result.changes) } };
  }
}

function createDatabase() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(`
    CREATE TABLE stores (
      id INTEGER PRIMARY KEY,
      meta_pixel_id TEXT, meta_capi_token TEXT, google_tag_manager_id TEXT,
      google_ads_conversion_id TEXT, google_ads_conversion_label TEXT
    );
    INSERT INTO stores VALUES (1, '1234567890', 'test-capi-token', '', '', '');
    CREATE TABLE rate_limits (
      bucket TEXT PRIMARY KEY, hits INTEGER NOT NULL, window_started_at TEXT NOT NULL
    );
    CREATE TABLE capi_event_outbox (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id TEXT NOT NULL UNIQUE, event_name TEXT NOT NULL, payload TEXT NOT NULL,
      status TEXT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0,
      max_attempts INTEGER NOT NULL DEFAULT 5, last_error TEXT,
      next_retry_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
  `);
  return {
    sqlite,
    prepare: (sql: string) => new Statement(sqlite, sql),
  };
}

let originalFetch: typeof globalThis.fetch;

beforeEach(() => {
  originalFetch = globalThis.fetch;
  // Nothing leaves this machine. The payload under test is written to the
  // outbox before transmission, which is exactly where it is read from.
  globalThis.fetch = (async () =>
    new Response(JSON.stringify({ events_received: 1 }), { status: 200 })) as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

async function postEvent(
  database: ReturnType<typeof createDatabase>,
  body: Record<string, unknown>,
  headers: Record<string, string> = {},
) {
  const request = new Request("https://toko.test/api/meta-event", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  const locals = { runtimeEnv: { OMS_DB: database as unknown as D1Database } } as App.Locals;
  return POST({ request, locals } as never);
}

const storedPayload = (database: ReturnType<typeof createDatabase>, eventId: string) =>
  JSON.parse(
    (database.sqlite
      .prepare("SELECT payload FROM capi_event_outbox WHERE event_id = ?")
      .get(eventId) as { payload: string }).payload,
  );

test("a ViewContent takes the country Cloudflare resolved for the request", async () => {
  const database = createDatabase();
  const response = await postEvent(
    database,
    {
      event_name: "ViewContent",
      event_id: "vc_probe_1",
      event_source_url: "https://toko.test/produk/senter-led-mini",
      content_ids: ["14001"],
      content_name: "Senter LED Mini",
      value: 89000,
      currency: "IDR",
    },
    { "cf-ipcountry": "ID" },
  );
  assert.equal(response.status, 200);
  assert.equal(storedPayload(database, "vc_probe_1").userData.country, "id");
});

test("a caller's own country claim is honoured over the edge", async () => {
  const database = createDatabase();
  await postEvent(
    database,
    {
      event_name: "PageView",
      event_id: "pv_probe_1",
      event_source_url: "https://toko.test/",
      user_data: { country: "sg" },
    },
    { "cf-ipcountry": "ID" },
  );
  assert.equal(storedPayload(database, "pv_probe_1").userData.country, "sg");
});

test("an unresolvable country is omitted rather than guessed", async () => {
  const database = createDatabase();
  await postEvent(
    database,
    {
      event_name: "PageView",
      event_id: "pv_probe_2",
      event_source_url: "https://toko.test/",
    },
    // Cloudflare's own not-a-country value. A hash of `xx` matches nobody, and
    // Meta scores match quality on the keys it was given.
    { "cf-ipcountry": "XX" },
  );
  assert.equal(storedPayload(database, "pv_probe_2").userData.country, undefined);
});
