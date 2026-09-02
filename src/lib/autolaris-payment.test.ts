import assert from "node:assert/strict";
import test from "node:test";
import {
  AUTOLARIS_CHANNEL_OPTIONS,
  parseAutoLarisPaymentResponse,
} from "./autolaris-client.ts";
import { summarizePaymentBuckets } from "./autolaris-balance.ts";
import {
  createAutoLarisDigitalOrderForPayment,
  effectivePaymentStatus,
  reconcileAutoLarisPaymentStatuses,
} from "./autolaris-payment.ts";

function createAutoLarisOrderDatabase(autoLarisApiKey: string | null) {
  const state = {
    transaction: null as null | Record<string, unknown>,
  };
  const order = {
    id: 41,
    order_number: "INV-10041",
    store_id: 1,
    customer_name: "Buyer",
    customer_phone: "081331000000",
    customer_email: "buyer@example.test",
    address: "Jl. Testing 1",
    province: "Jawa Timur",
    city: "Sidoarjo",
    district: "Waru",
    postal_code: "61256",
    total_amount: 118_400,
    payment_method: "qris",
    payment_fee_bearer: "seller",
    store_name: "Zvara Shop",
    warehouse_name: "Gudang Zvara",
    warehouse_contact_name: "Zvara Ops",
    warehouse_contact_phone: "08123456789",
    warehouse_address: "Jl. Gudang 2",
    warehouse_city: "Surabaya",
    warehouse_province: "Jawa Timur",
  };
  const items = [
    {
      quantity: 1,
      unit_price: 118_400,
      weight_grams: 500,
      product_title: "Produk Uji",
      variant_title: "Default",
    },
  ];

  const database = {
    prepare(sql: string) {
      const statement = {
        args: [] as unknown[],
        bind(...args: unknown[]) {
          statement.args = args;
          return statement;
        },
        async first() {
          if (sql.includes("FROM payment_transactions pt")) {
            return state.transaction;
          }
          if (sql.includes("SELECT o.id, o.order_number")) return order;
          if (sql.includes("SELECT mengantar_api_key")) {
            return {
              mengantar_api_key: null,
              mengantar_base_url: null,
              autolaris_api_key: autoLarisApiKey,
              autolaris_base_url: "https://autolaris.example.test",
            };
          }
          throw new Error(`Unexpected first query: ${sql}`);
        },
        async all() {
          if (sql.includes("FROM order_items oi")) {
            return { success: true, results: items, meta: {} };
          }
          throw new Error(`Unexpected all query: ${sql}`);
        },
        async run() {
          if (sql.includes("INSERT INTO payment_transactions")) {
            state.transaction = {
              id: 91,
              order_id: order.id,
              order_number: order.order_number,
              public_token: statement.args[2],
              channel_code: statement.args[3],
              fee_bearer: statement.args[4],
              status: "pending",
              amount: statement.args[5],
              admin_fee: statement.args[6],
              total_amount: statement.args[7],
              virtual_account: null,
              qr_payload: null,
              payment_code: null,
              provider_payment_url: null,
              expires_at: statement.args[8],
              failed_reason: null,
            };
          } else if (sql.includes("status = 'pending', amount = ?,\n          admin_fee = ?, total_amount = ?, provider_transaction_id = NULL")) {
            // A failed or expired row is reused for the retry.
            Object.assign(state.transaction!, {
              reference_id: statement.args[0],
              channel_code: statement.args[1],
              fee_bearer: statement.args[2],
              status: "pending",
              amount: statement.args[3],
              admin_fee: statement.args[4],
              total_amount: statement.args[5],
              virtual_account: null,
              qr_payload: null,
              payment_code: null,
              provider_payment_url: null,
              failed_reason: null,
              expires_at: statement.args[6],
            });
          } else if (sql.includes("provider_transaction_id = ?")) {
            Object.assign(state.transaction!, {
              amount: statement.args[1],
              admin_fee: statement.args[2],
              total_amount: statement.args[3],
              virtual_account: statement.args[4],
              qr_payload: statement.args[5],
              payment_code: statement.args[6],
              provider_payment_url: statement.args[7],
              expires_at: statement.args[8],
              failed_reason: null,
            });
          } else if (sql.includes("SET status = 'failed'")) {
            Object.assign(state.transaction!, {
              status: "failed",
              failed_reason: statement.args[0],
            });
          } else {
            throw new Error(`Unexpected run query: ${sql}`);
          }
          return { success: true, meta: { changes: 1 }, results: [] };
        },
      };
      return statement;
    },
  } as unknown as D1Database;

  return { database, state };
}

const QA_LOCALS = {
  tenant: { siteUrl: "https://store.example.test" },
  runtimeEnv: {
    AUTOLARIS_ORDER_ORIGIN_ID: "3517100",
    AUTOLARIS_ORDER_DESTINATION_ID: "3518010",
  },
} as App.Locals;

test("payment orchestration submits one non-physical digital order to AutoLaris", async (context) => {
  const originalFetch = globalThis.fetch;
  context.after(() => {
    globalThis.fetch = originalFetch;
  });
  const { database } = createAutoLarisOrderDatabase("qa-key");
  let requestedUrl = "";
  let requestedBody: Record<string, unknown> | undefined;
  globalThis.fetch = async (input, init) => {
    requestedUrl = String(input);
    requestedBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
    return Response.json({
      rc: "00",
      data: {
        transaction_id: "TRX-PAY-41",
        biaya_admin: 824,
        total: 118_400,
        payment_info: {
          expired: "2026-09-03 16:42:00",
          va: "",
          qr: "QR-PAYLOAD",
          url: "",
        },
      },
    });
  };

  const payment = await createAutoLarisDigitalOrderForPayment(database, QA_LOCALS, {
    orderId: 41,
    channelCode: "QRIS",
  });

  assert.equal(
    requestedUrl,
    "https://autolaris.example.test/api/h2h/submit",
  );
  // `INV-10041` is not a legal provider reference; the digits are.
  assert.equal(requestedBody?.reff_id, "10041");
  assert.equal(requestedBody?.courir_id, 1);
  assert.equal(requestedBody?.origin, 3517100);
  assert.equal(requestedBody?.destination, 3518010);
  assert.equal(requestedBody?.cod_value, "0");
  assert.equal(requestedBody?.callback_url, "");
  assert.deepEqual(requestedBody?.order_details, [
    { name: "Produk Uji - Default", qty: "1", unit_price: "118400" },
  ]);
  assert.equal(payment.qrPayload, "QR-PAYLOAD");
  assert.equal(payment.adminFee, 824);
  assert.equal(payment.totalAmount, 118_400);
});

test("payment orchestration records failure without a provider call when AutoLaris is unconfigured", async (context) => {
  const originalFetch = globalThis.fetch;
  context.after(() => {
    globalThis.fetch = originalFetch;
  });
  const { database } = createAutoLarisOrderDatabase(null);
  let providerCalls = 0;
  globalThis.fetch = async () => {
    providerCalls += 1;
    return new Response(null, { status: 500 });
  };

  const payment = await createAutoLarisDigitalOrderForPayment(database, QA_LOCALS, {
    orderId: 41,
    channelCode: "QRIS",
  });

  assert.equal(providerCalls, 0);
  assert.equal(payment.status, "failed");
  assert.match(payment.failedReason || "", /belum dikonfigurasi/i);
});

test("AutoLaris response parsing preserves provider instructions and billed total", () => {
  const payment = parseAutoLarisPaymentResponse({
    rc: "00",
    data: {
      trx_id: "TRX-123",
      virtual_account: "1234567890",
      qr: "000201010212...",
      payment_code: "PAY-123",
      url: "https://pay.example.test/TRX-123",
      amount: 180000,
      admin: 2500,
      total: 182500,
    },
  });
  assert.deepEqual(payment, {
    transactionId: "TRX-123",
    virtualAccount: "1234567890",
    qr: "000201010212...",
    paymentCode: "PAY-123",
    url: "https://pay.example.test/TRX-123",
    amount: 180000,
    admin: 2500,
    total: 182500,
  });
});

test("AutoLaris channels map QRIS separately from bank transfer channels", () => {
  const qris = AUTOLARIS_CHANNEL_OPTIONS.find((option) => option.code === "QRIS");
  assert.equal(qris?.paymentMethod, "qris");
  assert.equal(
    AUTOLARIS_CHANNEL_OPTIONS
      .filter((option) => option.code !== "QRIS")
      .every((option) => option.paymentMethod === "bank_transfer"),
    true,
  );
  assert.equal(
    AUTOLARIS_CHANNEL_OPTIONS.map((option) => String(option.code)).includes("DANA"),
    false,
  );
});

test("recorded balance separates paid funds, pending bills, fees, and failures", () => {
  const summary = summarizePaymentBuckets([
    { status: "paid", transaction_count: 2, billed_total: 350000, admin_fees: 5000 },
    { status: "pending", transaction_count: 1, billed_total: 175000, admin_fees: 2500 },
    { status: "failed", transaction_count: 3, billed_total: 0, admin_fees: 0 },
  ]);
  assert.deepEqual(summary, {
    paidFunds: 350000,
    pendingBilled: 175000,
    recordedFees: 7500,
    failedCount: 3,
  });
});

test("a failed instruction is regenerated on the next request, a live one is left alone", async (context) => {
  const originalFetch = globalThis.fetch;
  context.after(() => {
    globalThis.fetch = originalFetch;
  });
  const { database, state } = createAutoLarisOrderDatabase("qa-key");
  let providerCalls = 0;
  let providerAnswers = false;
  globalThis.fetch = async () => {
    providerCalls += 1;
    if (!providerAnswers) return new Response("upstream down", { status: 502 });
    return Response.json({
      rc: "00",
      data: {
        trx_id: "TRX-PAY-41-B",
        virtual_account: "",
        qr: "QR-PAYLOAD-B",
        payment_code: "",
        url: "",
        amount: 117_576,
        admin: 824,
        total: 118_400,
      },
    });
  };

  const first = await createAutoLarisDigitalOrderForPayment(database, QA_LOCALS, { orderId: 41, channelCode: "QRIS" });
  assert.equal(first.status, "failed");
  assert.equal(providerCalls, 1);

  // The provider recovers; the buyer asks again and gets a real instruction on
  // the same transaction row.
  providerAnswers = true;
  const second = await createAutoLarisDigitalOrderForPayment(database, QA_LOCALS, { orderId: 41, channelCode: "QRIS" });
  assert.equal(providerCalls, 2);
  // The retry carries a fresh, digits-only provider reference derived from the order sequence.
  assert.match(String(state.transaction?.reference_id), /^10041\d{6}$/);
  assert.equal(second.status, "pending");
  assert.equal(second.qrPayload, "QR-PAYLOAD-B");
  assert.equal(second.failedReason, undefined);
  assert.equal(state.transaction?.id, 91);

  // A live instruction is never regenerated.
  const third = await createAutoLarisDigitalOrderForPayment(database, QA_LOCALS, { orderId: 41, channelCode: "QRIS" });
  assert.equal(providerCalls, 2);
  assert.equal(third.qrPayload, "QR-PAYLOAD-B");
});

test("a pending instruction past its expiry reads as expired and is regenerated", async (context) => {
  const originalFetch = globalThis.fetch;
  context.after(() => {
    globalThis.fetch = originalFetch;
  });
  const { database, state } = createAutoLarisOrderDatabase("qa-key");
  let providerCalls = 0;
  globalThis.fetch = async () =>
    Response.json({
      rc: "00",
      data: {
        trx_id: `TRX-${(providerCalls += 1)}`,
        virtual_account: "8877001",
        qr: "",
        payment_code: "",
        url: "",
        amount: 117_576,
        admin: 824,
        total: 118_400,
      },
    });

  const live = await createAutoLarisDigitalOrderForPayment(database, QA_LOCALS, { orderId: 41, channelCode: "VABCA" });
  assert.equal(live.status, "pending");
  assert.ok(new Date(live.expiresAt || "").getTime() > Date.now());

  state.transaction!.expires_at = new Date(Date.now() - 60_000).toISOString();
  const expired = await createAutoLarisDigitalOrderForPayment(database, QA_LOCALS, { orderId: 41, channelCode: "VABCA" });
  assert.equal(providerCalls, 2, "an expired row is treated like a failed one");
  assert.equal(expired.status, "pending");
  assert.ok(new Date(expired.expiresAt || "").getTime() > Date.now());
});

test("payment status expiry is derived at read time, never stored", () => {
  const past = new Date(Date.now() - 1).toISOString();
  const future = new Date(Date.now() + 60_000).toISOString();
  assert.equal(effectivePaymentStatus("pending", past), "expired");
  assert.equal(effectivePaymentStatus("pending", future), "pending");
  assert.equal(effectivePaymentStatus("pending", null), "pending");
  assert.equal(effectivePaymentStatus("pending", "not a date"), "pending");
  // A final state is final regardless of the clock.
  assert.equal(effectivePaymentStatus("paid", past), "paid");
  assert.equal(effectivePaymentStatus("failed", past), "failed");
});

function createAdviceReconciliationDatabase() {
  const state = {
    transactionStatus: "pending",
    orderPaymentStatus: "pending",
    notifications: 0,
  };
  const database = {
    prepare(sql: string) {
      const statement = {
        sql,
        args: [] as unknown[],
        bind(...args: unknown[]) {
          statement.args = args;
          return statement;
        },
        async first() {
          if (sql.includes("SELECT mengantar_api_key")) {
            return {
              mengantar_api_key: null,
              mengantar_base_url: null,
              autolaris_api_key: "qa-key",
              autolaris_base_url: "https://autolaris.example.test",
            };
          }
          throw new Error(`Unexpected first query: ${sql}`);
        },
        async all() {
          if (sql.includes("pt.provider_transaction_id")) {
            return {
              success: true,
              results:
                state.transactionStatus === "pending" &&
                state.orderPaymentStatus === "pending"
                  ? [{
                      transaction_id: 91,
                      order_id: 41,
                      order_number: "INV-10041",
                      customer_name: "Buyer",
                      provider_transaction_id: "986770",
                      total_amount: 118_400,
                    }]
                  : [],
              meta: {},
            };
          }
          throw new Error(`Unexpected all query: ${sql}`);
        },
        async run() {
          if (sql.includes("INSERT OR IGNORE INTO notifications")) {
            state.notifications += 1;
            return { success: true, meta: { changes: 1 }, results: [] };
          }
          throw new Error(`Unexpected run query: ${sql}`);
        },
      };
      return statement;
    },
    async batch(statements: Array<{ sql: string }>) {
      return statements.map((statement) => {
        if (statement.sql.includes("UPDATE payment_transactions")) {
          const changes = state.transactionStatus === "pending" ? 1 : 0;
          if (changes) state.transactionStatus = "paid";
          return { success: true, meta: { changes }, results: [] };
        }
        if (statement.sql.includes("UPDATE orders")) {
          const changes =
            state.transactionStatus === "paid" &&
            state.orderPaymentStatus === "pending"
              ? 1
              : 0;
          if (changes) state.orderPaymentStatus = "paid";
          return { success: true, meta: { changes }, results: [] };
        }
        throw new Error(`Unexpected batch query: ${statement.sql}`);
      });
    },
  } as unknown as D1Database;
  return { database, state };
}

test("scheduled Advice reconciliation moves an explicit settlement exactly once", async (context) => {
  const originalFetch = globalThis.fetch;
  context.after(() => {
    globalThis.fetch = originalFetch;
  });
  const { database, state } = createAdviceReconciliationDatabase();
  let providerCalls = 0;
  globalThis.fetch = async (_input, init) => {
    providerCalls += 1;
    assert.deepEqual(JSON.parse(String(init?.body)), { transaction_id: "986770" });
    return Response.json({ rc: "00", ket: "PAID", data: { awb: "" } });
  };

  const first = await reconcileAutoLarisPaymentStatuses(
    database,
    QA_LOCALS,
    new Date("2026-09-02T17:00:00.000Z"),
  );
  assert.deepEqual(first.paidOrderIds, [41]);
  assert.equal(state.transactionStatus, "paid");
  assert.equal(state.orderPaymentStatus, "paid");
  assert.equal(state.notifications, 1);

  const duplicate = await reconcileAutoLarisPaymentStatuses(database, QA_LOCALS);
  assert.equal(providerCalls, 1);
  assert.deepEqual(duplicate.paidOrderIds, []);
  assert.equal(state.notifications, 1);
});

test("scheduled Advice leaves PENDING and DELIVERED payment state untouched", async (context) => {
  const originalFetch = globalThis.fetch;
  context.after(() => {
    globalThis.fetch = originalFetch;
  });
  const { database, state } = createAdviceReconciliationDatabase();
  globalThis.fetch = async () =>
    Response.json({ rc: "02", ket: "PENDING", data: { awb: "" } });
  const pending = await reconcileAutoLarisPaymentStatuses(database, QA_LOCALS);
  assert.equal(pending.pending, 1);

  globalThis.fetch = async () =>
    Response.json({ rc: "00", ket: "DELIVERED", data: { awb: "" } });
  const delivered = await reconcileAutoLarisPaymentStatuses(database, QA_LOCALS);
  assert.equal(delivered.unproven, 1);
  assert.equal(state.transactionStatus, "pending");
  assert.equal(state.orderPaymentStatus, "pending");
  assert.equal(state.notifications, 0);
});
