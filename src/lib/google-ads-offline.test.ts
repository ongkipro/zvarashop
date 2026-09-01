import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import {
  buildGoogleClickConversion,
  decideGoogleRetry,
  readGoogleAdsOfflineConfig,
  reconcileGoogleAdsConversions,
  uploadGoogleClickConversion,
  purgeExpiredGoogleAdsOutboxEvents,
} from "./google-ads-offline.ts";

const CONFIG = {
  customerId: "1234567890",
  conversionActionId: "987654321",
  developerToken: "developer-token",
  clientId: "client-id",
  clientSecret: "client-secret",
  refreshToken: "refresh-token",
  loginCustomerId: "1122334455",
  startAt: "2026-08-25T00:00:00.000Z",
};

const ORDER = {
  id: 42,
  order_number: "INV-10042",
  payment_method: "cod",
  payment_status: "unpaid",
  shipping_status: "delivered",
  created_at: "2026-08-25T01:00:00.000Z",
  ad_click_ids: JSON.stringify({ gclid: "Cj0KCQ_valid-click" }),
  product_value: 249000,
};

test("offline config is all-or-nothing and requires an explicit backfill boundary", () => {
  assert.deepEqual(readGoogleAdsOfflineConfig({
    GOOGLE_ADS_CUSTOMER_ID: "123-456-7890",
    GOOGLE_ADS_OFFLINE_CONVERSION_ACTION_ID: "987654321",
    GOOGLE_ADS_LOGIN_CUSTOMER_ID: "112-233-4455",
    GOOGLE_ADS_DEVELOPER_TOKEN: "developer-token",
    GOOGLE_ADS_CLIENT_ID: "client-id",
    GOOGLE_ADS_CLIENT_SECRET: "client-secret",
    GOOGLE_ADS_REFRESH_TOKEN: "refresh-token",
    GOOGLE_ADS_OFFLINE_START_AT: "2026-08-25T00:00:00.000Z",
  }), CONFIG);
  assert.equal(readGoogleAdsOfflineConfig({
    GOOGLE_ADS_CUSTOMER_ID: "1234567890",
    GOOGLE_ADS_OFFLINE_CONVERSION_ACTION_ID: "987654321",
  }), null);
});

test("COD delivered and online paid produce one click conversion with merchandise value", () => {
  const observedAt = new Date("2026-08-25T02:03:04.000Z");
  const cod = buildGoogleClickConversion(ORDER, CONFIG, observedAt);
  assert.deepEqual(cod, {
    qualification: "cod_delivered",
    conversion: {
      conversionAction: "customers/1234567890/conversionActions/987654321",
      conversionDateTime: "2026-08-25 02:03:04+00:00",
      conversionValue: 249000,
      currencyCode: "IDR",
      orderId: "INV-10042",
      gclid: "Cj0KCQ_valid-click",
    },
  });
  const online = buildGoogleClickConversion({
    ...ORDER,
    payment_method: "qris",
    payment_status: "paid",
    shipping_status: "pending",
    ad_click_ids: JSON.stringify({ gbraid: "0AAAA_valid" }),
  }, CONFIG, observedAt);
  assert.equal(online?.qualification, "online_paid");
  assert.equal(online?.conversion.gbraid, "0AAAA_valid");
});

test("unqualified, unattributed, and valueless orders never enter the outbox", () => {
  const observedAt = new Date("2026-08-25T02:03:04.000Z");
  assert.equal(buildGoogleClickConversion({ ...ORDER, shipping_status: "shipped" }, CONFIG, observedAt), null);
  assert.equal(buildGoogleClickConversion({ ...ORDER, ad_click_ids: null }, CONFIG, observedAt), null);
  assert.equal(buildGoogleClickConversion({ ...ORDER, product_value: 0 }, CONFIG, observedAt), null);
});

test("retry policy retries rate limits and network failures but stops permanent client errors", () => {
  assert.deepEqual(decideGoogleRetry(true, 200, 0, 5), { status: "sent", delayMs: 0 });
  assert.deepEqual(decideGoogleRetry(false, 429, 0, 5), { status: "pending", delayMs: 900000 });
  assert.deepEqual(decideGoogleRetry(false, 400, 0, 5), { status: "failed", delayMs: 0 });
  assert.equal(decideGoogleRetry(false, undefined, 1, 5).status, "pending");
  assert.equal(decideGoogleRetry(false, 500, 4, 5).status, "failed");
});

class ReconcileStatement {
  private sqlite: DatabaseSync;
  private sql: string;
  private values: unknown[];

  constructor(sqlite: DatabaseSync, sql: string, values: unknown[] = []) {
    this.sqlite = sqlite;
    this.sql = sql;
    this.values = values;
  }

  bind(...values: unknown[]) {
    return new ReconcileStatement(this.sqlite, this.sql, values);
  }

  async all<T>() {
    return {
      success: true,
      results: this.sqlite.prepare(this.sql).all(...(this.values as never[])) as T[],
      meta: { changes: 0, last_row_id: 0 },
    };
  }

  async run() {
    const result = this.sqlite.prepare(this.sql).run(...(this.values as never[]));
    return {
      success: true,
      meta: {
        changes: Number(result.changes),
        last_row_id: Number(result.lastInsertRowid),
      },
    };
  }
}

test("Google reconciliation advances past organic orders without click IDs", async () => {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(`
    CREATE TABLE orders (
      id INTEGER PRIMARY KEY, order_number TEXT NOT NULL, payment_method TEXT NOT NULL,
      payment_status TEXT NOT NULL, shipping_status TEXT NOT NULL,
      created_at TEXT NOT NULL, ad_click_ids TEXT
    );
    CREATE TABLE order_items (
      id INTEGER PRIMARY KEY, order_id INTEGER NOT NULL,
      unit_price INTEGER NOT NULL, quantity INTEGER NOT NULL
    );
  `);
  sqlite.exec(
    readFileSync(
      new URL("../db/migrations/0048_google_ads_conversion_outbox.sql", import.meta.url),
      "utf8",
    ).replaceAll("--> statement-breakpoint", ""),
  );

  const insertOrder = (id: number, clickIds: string | null) => {
    sqlite.prepare(
      `INSERT INTO orders VALUES (?, ?, 'cod', 'unpaid', 'delivered', '2026-08-26T00:00:00.000Z', ?)`,
    ).run(id, `INV-${10000 + id}`, clickIds);
    sqlite.prepare(`INSERT INTO order_items VALUES (?, ?, 100000, 1)`).run(id, id);
  };
  for (let id = 1; id <= 60; id += 1) insertOrder(id, null);
  insertOrder(61, JSON.stringify({ utm_source: "instagram" }));
  insertOrder(62, JSON.stringify({ gclid: "Cj0KCQ_real-click" }));

  const database = {
    prepare: (sql: string) => new ReconcileStatement(sqlite, sql),
  } as unknown as D1Database;
  assert.equal(
    await reconcileGoogleAdsConversions(database, CONFIG, new Date("2026-08-27T00:00:00.000Z")),
    1,
  );
  const rows = sqlite.prepare(
    `SELECT order_number FROM google_ads_conversion_outbox`,
  ).all() as { order_number: string }[];
  assert.deepEqual(rows.map((row) => row.order_number), ["INV-10062"]);
});

test("sender refreshes OAuth and uploads through the pinned Google Ads API contract", async (context) => {
  const originalFetch = globalThis.fetch;
  context.after(() => { globalThis.fetch = originalFetch; });
  const requests: Array<{ url: string; init?: RequestInit }> = [];
  globalThis.fetch = async (input, init) => {
    requests.push({ url: String(input), init });
    if (String(input).includes("oauth2.googleapis.com")) {
      return new Response(JSON.stringify({ access_token: "access-token" }), { status: 200 });
    }
    return new Response(JSON.stringify({ results: [{}] }), { status: 200 });
  };
  const built = buildGoogleClickConversion(ORDER, CONFIG, new Date("2026-08-25T02:03:04.000Z"));
  assert.ok(built);
  const result = await uploadGoogleClickConversion(built.conversion, CONFIG);
  assert.equal(result.success, true);
  assert.equal(requests[1].url, "https://googleads.googleapis.com/v25/customers/1234567890:uploadClickConversions");
  const headers = new Headers(requests[1].init?.headers);
  assert.equal(headers.get("developer-token"), "developer-token");
  assert.equal(headers.get("login-customer-id"), "1122334455");
  assert.equal(headers.get("authorization"), "Bearer access-token");
  const body = JSON.parse(String(requests[1].init?.body));
  assert.deepEqual(body, { conversions: [built.conversion], partialFailure: true });
});

test("terminal Google Ads outbox rows have bounded retention", async () => {
  let statementSql = "";
  let bound: unknown[] = [];
  const database = {
    prepare(sql: string) {
      statementSql = sql;
      return {
        bind(...values: unknown[]) {
          bound = values;
          return this;
        },
        async run() {
          return { success: true, meta: { changes: 4 } };
        },
      };
    },
  } as unknown as D1Database;
  assert.equal(
    await purgeExpiredGoogleAdsOutboxEvents(
      database,
      new Date("2026-09-01T00:00:00.000Z"),
    ),
    4,
  );
  assert.match(statementSql, /status IN \('sent', 'failed'\)/);
  assert.match(statementSql, /'-30 days'/);
  assert.deepEqual(bound, ["2026-09-01T00:00:00.000Z"]);
});
