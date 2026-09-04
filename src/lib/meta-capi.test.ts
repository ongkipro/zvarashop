import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { META_GRAPH_API_VERSION, sendMetaCapiEvent, toE164Digits, verifyMetaPixelIdentity } from './meta-capi.ts';

test('Indonesian storefront phones normalize to the E.164 form Meta matches on', () => {
  assert.equal(toE164Digits('081234567890'), '6281234567890');
  assert.equal(toE164Digits('0812-3456-7890'), '6281234567890');
  assert.equal(toE164Digits('+62 812 3456 7890'), '6281234567890');
  assert.equal(toE164Digits('6281234567890'), '6281234567890');
});

test('blank phone input yields no hash rather than a hash of nothing', () => {
  assert.equal(toE164Digits(''), undefined);
  assert.equal(toE164Digits(undefined), undefined);
  assert.equal(toE164Digits('---'), undefined);
});

test('Meta CAPI uses supported API version and forwards test event code', async (context) => {
  const originalFetch = globalThis.fetch;
  context.after(() => {
    globalThis.fetch = originalFetch;
  });

  let requestUrl = '';
  let requestBody: unknown;
  globalThis.fetch = async (input, init) => {
    requestUrl = String(input);
    requestBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
    return new Response(JSON.stringify({ events_received: 1 }), {
      status: 200,
    });
  };

  const result = await sendMetaCapiEvent(
    'PageView',
    'settings_test_1',
    'https://contoh-toko.example/admin/ads/meta',
    {
      phone: '081234567890',
      name: 'Siti',
      externalId: '0123456789abcdef0123456789abcdef',
      clientIp: '127.0.0.1',
      userAgent: 'test',
    },
    { contentName: 'ZvaraShop Meta CAPI connection test' },
    '123456789',
    'test-token',
    'TEST12345',
  );

  assert.equal(result.success, true);
  assert.equal(requestUrl, `https://graph.facebook.com/${META_GRAPH_API_VERSION}/123456789/events?access_token=test-token`);
  assert.ok(requestBody && typeof requestBody === 'object');
  const payload = requestBody as Record<string, unknown>;
  assert.equal(payload.test_event_code, 'TEST12345');
  const data = payload.data as Array<{
    user_data: { ph: string[]; fn: string[]; external_id: string[] };
  }>;
  assert.match(data[0].user_data.ph[0], /^[a-f0-9]{64}$/);
  assert.match(data[0].user_data.fn[0], /^[a-f0-9]{64}$/);
  assert.match(data[0].user_data.external_id[0], /^[a-f0-9]{64}$/);
  assert.notEqual(data[0].user_data.ph[0], '081234567890');
  assert.notEqual(
    data[0].user_data.external_id[0],
    '0123456789abcdef0123456789abcdef',
  );
});

test("content_type is sent only where content_ids give it something to describe", async () => {
  const sent: Record<string, unknown>[] = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (_url: string, init: RequestInit) => {
    sent.push(JSON.parse(String(init.body)));
    return new Response(JSON.stringify({ events_received: 1 }), { status: 200 });
  }) as typeof fetch;
  try {
    await sendMetaCapiEvent(
      "PageView", "pv_1", "https://toko.test/", {}, {}, "1234567890", "token",
    );
    await sendMetaCapiEvent(
      "ViewContent", "vc_1", "https://toko.test/produk/x", {},
      { contentIds: ["14001"], value: 89000 }, "1234567890", "token",
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
  const custom = (index: number) =>
    (sent[index] as { data: { custom_data: Record<string, unknown> }[] }).data[0].custom_data;
  // A content type without content ids is a claim about nothing, and Events
  // Manager reports it as a malformed parameter on every single PageView.
  assert.equal(custom(0).content_type, undefined);
  assert.equal(custom(1).content_type, "product");
  assert.deepEqual(custom(1).content_ids, ["14001"]);
});

// The 2026-09-03 outage: a Business Manager ID saved into the Pixel ID field.
// `^\d{5,25}$` accepted it, both legs died silently, and it took reading Graph
// API error codes to find. These are the exact responses Meta gave.

const graphStub = (responses: Record<string, { ok: boolean; body: unknown }>) =>
  (async (input: URL | RequestInfo) => {
    const url = new URL(String(input));
    const fields = url.searchParams.get("fields") ?? "";
    const key = fields.includes("last_fired_time") ? "pixelField" : "named";
    const hit = responses[key];
    return new Response(JSON.stringify(hit.body), { status: hit.ok ? 200 : 400 });
  }) as typeof fetch;

test("a real pixel is recognised", async () => {
  const identity = await verifyMetaPixelIdentity("511101804635811", "token", graphStub({
    pixelField: { ok: true, body: { id: "511101804635811", name: "Zvara Dataset", last_fired_time: "2026-09-04T06:00:00+0000" } },
    named: { ok: true, body: { id: "511101804635811", name: "Zvara Dataset" } },
  }));
  assert.deepEqual(identity, { state: "pixel", name: "Zvara Dataset" });
});

test("a Business Manager ID is refused, and named", async () => {
  // Exactly what Meta returned for 1566746954921686: the object resolves and
  // has a name, but the AdsPixel field does not exist on it.
  const identity = await verifyMetaPixelIdentity("1566746954921686", "token", graphStub({
    pixelField: { ok: false, body: { error: { code: 100, message: "(#100) Tried accessing nonexisting field (last_fired_time) on node type (Business)" } } },
    named: { ok: true, body: { id: "1566746954921686", name: "Winning Mall" } },
  }));
  assert.deepEqual(identity, { state: "not-a-pixel", name: "Winning Mall" });
});

test("an unreachable object is unknown, never refused", async () => {
  // Subcode 33 is also what a missing asset permission produces. Refusing here
  // would block a correct ID behind a fixable permission problem.
  const identity = await verifyMetaPixelIdentity("511101804635811", "token", graphStub({
    pixelField: { ok: false, body: { error: { code: 100, error_subcode: 33, message: "Unsupported get request. Object with ID ... does not exist" } } },
    named: { ok: false, body: {} },
  }));
  assert.equal(identity.state, "unknown");
});

test("a permission error is unknown, never refused", async () => {
  const identity = await verifyMetaPixelIdentity("511101804635811", "token", graphStub({
    pixelField: { ok: false, body: { error: { code: 200, message: "(#200) Requires business_management permission" } } },
    named: { ok: false, body: {} },
  }));
  assert.equal(identity.state, "unknown");
});

test("an unreachable Meta never blocks a save", async () => {
  const identity = await verifyMetaPixelIdentity("511101804635811", "token", (async () => {
    throw new Error("network down");
  }) as typeof fetch);
  assert.deepEqual(identity, { state: "unknown", reason: "network down" });
});

test("saving the Meta config refuses an ID Meta says is not a pixel", () => {
  const source = readFileSync(new URL("../pages/api/admin/ads.ts", import.meta.url), "utf8");
  const branch = source.slice(source.indexOf("if (body.action === 'save-meta')"));
  assert.match(branch, /verifyMetaPixelIdentity\(/, "save-meta must ask Meta what the ID is");
  assert.match(branch, /identity\.state === 'not-a-pixel'/);
  // Inconclusive must warn, not block.
  assert.match(branch, /identity\.state === 'unknown'/);
  assert.match(branch, /identityWarning =/);
});
