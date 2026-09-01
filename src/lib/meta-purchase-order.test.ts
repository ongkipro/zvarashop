import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import {
  findPurchaseOrderByStatusToken,
  findPurchaseOrderForApiKeyCaller,
  resolveMetaPurchaseContentIds,
} from "./meta-purchase-order.ts";
import { sendMetaCapiEvent } from "./meta-capi.ts";
import { checkRateLimit } from "./rate-limit.ts";

class Statement {
  private sqlite: DatabaseSync;
  private sql: string;
  private values: unknown[];

  constructor(sqlite: DatabaseSync, sql: string, values: unknown[] = []) {
    this.sqlite = sqlite;
    this.sql = sql;
    this.values = values;
  }

  bind(...values: unknown[]) {
    return new Statement(this.sqlite, this.sql, values);
  }

  async first<T>() {
    return (this.sqlite.prepare(this.sql).get(...(this.values as never[])) as T) ?? null;
  }
}

function purchaseDatabase() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(`
    CREATE TABLE orders (
      id INTEGER PRIMARY KEY, order_number TEXT NOT NULL,
      customer_name TEXT NOT NULL, customer_phone TEXT NOT NULL, customer_email TEXT,
      province TEXT NOT NULL, city TEXT NOT NULL, postal_code TEXT,
      total_amount INTEGER NOT NULL, payment_method TEXT NOT NULL,
      payment_status TEXT NOT NULL, public_status_token TEXT,
      ad_click_ids TEXT, meta_request_context TEXT
    );
    CREATE TABLE order_items (
      id INTEGER PRIMARY KEY, order_id INTEGER NOT NULL,
      variant_id INTEGER NOT NULL, unit_price INTEGER NOT NULL, quantity INTEGER NOT NULL
    );
    CREATE TABLE products (id INTEGER PRIMARY KEY, title TEXT NOT NULL);
    CREATE TABLE product_variants (id INTEGER PRIMARY KEY, product_id INTEGER NOT NULL);
    INSERT INTO orders VALUES (
      41, 'INV-10041', 'Nur Aisyah', '081234567890', NULL,
      'Jawa Barat', 'Bandung', '40111', 214000, 'cod', 'unpaid', 'tok-41',
      '{"_fbp":"fb.1.1700000000.browser"}',
      '{"clientIp":"203.0.113.7"}'
    );
    INSERT INTO products VALUES (10041, 'Produk Uji');
    INSERT INTO product_variants VALUES (501, 10041);
    INSERT INTO order_items VALUES (1, 41, 501, 45000, 3);
  `);
  return {
    sqlite,
    database: { prepare: (sql: string) => new Statement(sqlite, sql) } as unknown as D1Database,
  };
}

test("public Purchase requires its status token while an API key still resolves a real order", async () => {
  const { database } = purchaseDatabase();
  assert.equal(await findPurchaseOrderByStatusToken(database, "INV-10041", "wrong"), null);
  assert.equal(
    (await findPurchaseOrderByStatusToken(database, "41", "tok-41"))?.order_number,
    "INV-10041",
  );
  assert.equal(await findPurchaseOrderForApiKeyCaller(database, "INV-99999"), null);
  const resolved = await findPurchaseOrderForApiKeyCaller(database, "INV-10041");
  assert.equal(resolved?.product_value, 135000);
  assert.equal(resolved?.total_amount, 214000);
  assert.equal(resolved?.product_ids, "10041");
});

test("Purchase content IDs come from order items, never the submitted browser value", () => {
  const order = { product_ids: "10041,10042,invalid,10041" };
  assert.deepEqual(resolveMetaPurchaseContentIds(order as never, ["99999"]), [
    "10041",
    "10042",
  ]);
  assert.equal(resolveMetaPurchaseContentIds({ product_ids: null } as never, ["99999"]), undefined);
  assert.deepEqual(resolveMetaPurchaseContentIds(null, ["99999"]), ["99999"]);
});

test("a Meta Purchase without canonical order_number is rejected before fetch", async () => {
  const originalFetch = globalThis.fetch;
  let fetched = false;
  globalThis.fetch = async () => {
    fetched = true;
    return new Response("{}", { status: 200 });
  };
  try {
    const refused = await sendMetaCapiEvent(
      "Purchase",
      "INV-10041",
      "https://shop.example/thanks",
      { phone: "081234567890" },
      { contentIds: ["10001"], value: 135000, currency: "IDR" },
      "1234567890",
      "capi-token",
    );
    assert.equal(refused.success, false);
    assert.equal(fetched, false);

    const accepted = await sendMetaCapiEvent(
      "Purchase",
      "INV-10041",
      "https://shop.example/thanks",
      { phone: "081234567890" },
      { contentIds: ["10001"], value: 135000, currency: "IDR", orderNumber: "INV-10041" },
      "1234567890",
      "capi-token",
    );
    assert.equal(accepted.success, true);
    assert.equal(fetched, true);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("the public Meta endpoint is wired to sixty events per minute per IP", async () => {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(
    readFileSync(
      new URL("../db/migrations/0049_admin_sessions_and_rate_limits.sql", import.meta.url),
      "utf8",
    ).replaceAll("--> statement-breakpoint", ""),
  );
  const database = {
    prepare: (sql: string) => new Statement(sqlite, sql),
  } as unknown as D1Database;

  const call = () => checkRateLimit(database, "public-meta-event:203.0.113.7", 60, 60_000);
  for (let count = 0; count < 60; count += 1) {
    assert.equal((await call()).allowed, true);
  }
  assert.equal((await call()).allowed, false);

  const route = readFileSync(new URL("../pages/api/meta-event.ts", import.meta.url), "utf8");
  assert.match(route, /`public-meta-event:\$\{clientIp\}`[\s\S]*60,[\s\S]*60_000/);
});
