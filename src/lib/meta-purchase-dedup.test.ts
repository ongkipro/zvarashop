import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { resolveMetaEventId } from "./meta-capi.ts";
import { META_EXTERNAL_ID_COOKIE } from "./click-ids.ts";
import { sha256Hex } from "./meta-identity.ts";

// Meta only deduplicates a browser Pixel event against a server CAPI event when
// both carry the same event_id. The server leg is authoritative and keys Purchase
// on the order number (`resolveMetaEventId`), so the browser leg on /thanks must
// quote that same order number instead of minting one of its own.

const TRACKER_SOURCE = readFileSync(
  new URL("../components/storefront/tracking/MetaThanksTracker.astro", import.meta.url),
  "utf8",
);
const THANKS_SOURCE = readFileSync(
  new URL("../pages/thanks.astro", import.meta.url),
  "utf8",
);
const PIXEL_BASE_SOURCE = readFileSync(
  new URL("../components/storefront/tracking/MetaPixelBase.astro", import.meta.url),
  "utf8",
);

const inlineScript = (source: string, label: string) => {
  const match = source.match(/<script\b[^>]*\bis:inline\b[^>]*>([\s\S]*)<\/script>/);
  assert.ok(match, `${label} must keep its inline script`);
  return match[1];
};

const INLINE_SCRIPT = inlineScript(TRACKER_SOURCE, "MetaThanksTracker");
const PIXEL_BASE_SCRIPT = inlineScript(PIXEL_BASE_SOURCE, "MetaPixelBase");

const PIXEL_ID = "1234567890";

type OrderStatus = Record<string, unknown>;

type TrackerRun = {
  /** eventID of each browser Purchase; PageView is tracked in `trackedEvents`. */
  pixelEventIds: string[];
  postedPayloads: Record<string, unknown>[];
  /** Every `fbq('init', …)` fbevents would actually have honoured. */
  pixelInitCalls: Record<string, unknown>[];
  /** The advanced matching the pixel ends up carrying, as fbevents would hold it. */
  pixelUserData: Record<string, unknown> | undefined;
  trackedEvents: string[];
  pixelLoadPulledForward: boolean;
  guardKeys: string[];
};

function storageStub(throwOnWrite = false) {
  const store = new Map<string, string>();
  return {
    keys: () => [...store.keys()],
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      if (throwOnWrite) throw new Error("QuotaExceededError");
      store.set(key, String(value));
    },
  };
}

/**
 * fbevents.js, as far as this contract is concerned: it honours `init` for a
 * given pixel id exactly once and silently ignores every later one. Verified
 * against the live library on 2026-08-28 — a second
 * `fbq('init', id, {ph, fn, ct})` left `pixelsByID[id].userData` as the
 * `{external_id}` the first init had set. A stub that merged instead would have
 * happily passed the code that shipped this bug to production.
 */
function fbeventsStub(run: TrackerRun) {
  const pixels = new Map<string, Record<string, unknown>>();
  const fbq = (
    action: string,
    subject: unknown,
    payload?: unknown,
    options?: { eventID?: string },
  ) => {
    if (action === "init") {
      const id = String(subject);
      if (pixels.has(id)) return;
      const userData = (payload && typeof payload === "object" ? payload : {}) as Record<
        string,
        unknown
      >;
      pixels.set(id, { ...userData });
      run.pixelInitCalls.push({ ...userData });
      run.pixelUserData = pixels.get(id);
      return;
    }
    if (action === "track") {
      run.trackedEvents.push(String(subject));
      if (String(subject) === "Purchase") {
        run.pixelEventIds.push(String(options?.eventID || ""));
      }
    }
  };
  return fbq;
}

/**
 * Executes the real inline scripts from MetaPixelBase.astro **and**
 * MetaThanksTracker.astro against one stubbed browser, with /api/order-status
 * answering `orderStatus`. Both are run because the bug they exist to prevent
 * only appears in the seam between them: each was individually correct while the
 * pair sent Meta a Purchase matched on `external_id` alone.
 */
async function runTracker(
  orderStatus: OrderStatus,
  thanksStateOverrides: Record<string, unknown> = {},
  documentCookie = "",
  options: { awaitMatching?: boolean; localStorageThrows?: boolean } = {},
): Promise<TrackerRun> {
  const run: TrackerRun = {
    pixelEventIds: [],
    postedPayloads: [],
    pixelInitCalls: [],
    pixelUserData: undefined,
    trackedEvents: [],
    pixelLoadPulledForward: false,
    guardKeys: [],
  };
  const thanksState = {
    order_id: "INV-10042",
    order_pk: "42",
    status_token: "status-token-42",
    payment_method: "cod",
    event_id: "lead_asahan_1754400000000_ab12cd",
    name: "Siti Rahayu",
    phone: "081234567890",
    product_id: "434683",
    product_name: "Asahan Portable",
    product_price: 150_000,
    quantity: 1,
    ...thanksStateOverrides,
  };

  const sessionStorage = storageStub();
  sessionStorage.setItem("thanks_state", JSON.stringify(thanksState));
  const localStorage = storageStub(options.localStorageThrows === true);

  const fetchStub = (input: string, init?: { body?: string }) => {
    if (input.startsWith("/api/order-status")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          content_ids: ["434683"],
          product_name: "Asahan Portable",
          ...orderStatus,
        }),
      });
    }
    if (input.startsWith("/api/meta-event")) {
      run.postedPayloads.push(JSON.parse(String(init?.body || "{}")));
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) });
    }
    throw new Error(`unexpected request: ${input}`);
  };

  const cookies = new Map<string, string>();
  for (const part of documentCookie.split(";")) {
    const pair = part.trim();
    if (!pair) continue;
    const separator = pair.indexOf("=");
    if (separator > 0) cookies.set(pair.slice(0, separator), pair.slice(separator + 1));
  }
  const documentStub = {
    get cookie() {
      return [...cookies].map(([name, value]) => `${name}=${value}`).join("; ");
    },
    set cookie(value: string) {
      const [pair] = value.split(";");
      const separator = pair.indexOf("=");
      cookies.set(pair.slice(0, separator), pair.slice(separator + 1));
    },
    createElement: () => ({}),
    head: { appendChild: () => undefined },
  };

  const windowStub: Record<string, any> = {
    // What `/thanks` declares in its head slot, ahead of MetaPixelBase.
    __PS_META_AWAIT_MATCHING__: options.awaitMatching !== false,
    location: {
      search: "",
      href: "https://permatamall.shop/thanks",
      protocol: "https:",
    },
    addEventListener: () => undefined,
    // The 2.5 s deferral timer never fires here: the assertions are about what
    // the page does on its own, not about the backstop rescuing it.
    setTimeout: () => 1,
    fbq: fbeventsStub(run),
  };

  const pixelBase = new Function(
    "pixelId",
    "metaExternalIdCookie",
    "window",
    "document",
    "crypto",
    "TextEncoder",
    "Uint8Array",
    PIXEL_BASE_SCRIPT,
  );
  pixelBase(
    PIXEL_ID,
    META_EXTERNAL_ID_COOKIE,
    windowStub,
    documentStub,
    globalThis.crypto,
    TextEncoder,
    Uint8Array,
  );

  const baseLoadPixel = windowStub.__PS_LOAD_META_PIXEL__;
  windowStub.__PS_LOAD_META_PIXEL__ = () => {
    run.pixelLoadPulledForward = true;
    if (typeof baseLoadPixel === "function") baseLoadPixel();
  };

  const tracker = new Function(
    "tenantName",
    "tenantSlug",
    "metaExternalIdCookie",
    "window",
    "document",
    "navigator",
    "sessionStorage",
    "localStorage",
    "fetch",
    INLINE_SCRIPT,
  );

  tracker(
    "Permatamall",
    "permatamall",
    META_EXTERNAL_ID_COOKIE,
    windowStub,
    documentStub,
    { userAgent: "node-test" },
    sessionStorage,
    localStorage,
    fetchStub,
  );

  // The script fires asynchronously (status fetch + SHA-256 hashing).
  for (let i = 0; i < 40 && run.postedPayloads.length === 0; i += 1) {
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
  await new Promise((resolve) => setTimeout(resolve, 5));
  run.guardKeys = localStorage.keys();
  return run;
}

test("browser and server Purchase legs derive the same event_id for one order", async () => {
  const run = await runTracker({
    success: true,
    order_number: "INV-10042",
    payment_status: "unpaid",
    payment_method: "cod",
    is_paid: false,
    total_amount: 189_000,
  });

  const serverEventId = resolveMetaEventId("Purchase", "browser-generated-event-id", "INV-10042");

  assert.equal(run.postedPayloads.length, 1, "the browser must post exactly one Purchase to CAPI");
  assert.equal(run.pixelEventIds.length, 1, "the browser Pixel must fire exactly one Purchase");
  assert.equal(serverEventId, "INV-10042");
  assert.equal(run.pixelEventIds[0], serverEventId);
  assert.equal(run.postedPayloads[0].event_id, serverEventId);
  // The route re-resolves the order from these, and substitutes its order_number
  // as the event_id - the same string the Pixel just used.
  assert.equal(run.postedPayloads[0].order_number, "INV-10042");
  assert.equal(run.postedPayloads[0].status_token, "status-token-42");
});

test("the buyer's match keys survive onto the one init fbevents actually honours", async () => {
  // This is the bug this pair of scripts exists to prevent, and it shipped:
  // MetaPixelBase initialised the pixel on `external_id` alone at page load, and
  // MetaThanksTracker then called `fbq('init', pixelId, {ph, fn, ln, ct, st, zp,
  // country})` a second time. fbevents ignores a repeat init, so every hash the
  // tracker computed was discarded and Meta received a browser Purchase matched
  // on one key while the CAPI leg for the same order carried seven. Both files
  // typechecked, both had passing tests, and the pixel reported no error.
  const run = await runTracker(
    {
      success: true,
      order_number: "INV-10042",
      payment_status: "unpaid",
      payment_method: "cod",
      is_paid: false,
      total_amount: 189_000,
    },
    {
      city: "Jakarta Selatan",
      province: "DKI Jakarta",
      postal_code: "12430",
    },
  );

  assert.equal(
    run.pixelInitCalls.length,
    1,
    "exactly one fbq('init') may reach fbevents — a second is silently dropped",
  );
  const advancedMatching = run.pixelUserData ?? {};
  for (const key of ["ph", "fn", "ln", "ct", "st", "zp", "country", "external_id"]) {
    assert.match(
      String(advancedMatching[key] ?? ""),
      /^[a-f0-9]{64}$/,
      `the pixel's advanced matching lost ${key} — a repeat init cannot add it back`,
    );
  }
  // MetaPixelBase minted a first-party visitor ID for this page, so the buyer's
  // advertiser identity is that, not their phone number. Collapsing the two
  // would change `external_id` at checkout and split one visitor's funnel in
  // half — the phone fallback exists only for a session that predates the cookie.
  assert.notEqual(advancedMatching.ph, advancedMatching.external_id);
  // `client_user_agent` is a Conversions API field. The live pixel stores it on
  // `userData` without a censored-format entry, i.e. it is not a match key.
  assert.equal(advancedMatching.client_user_agent, undefined);

  // The CAPI leg on the same Purchase must describe the same address, not a
  // different or narrower one.
  const capiUserData = run.postedPayloads[0].user_data as Record<string, unknown>;
  assert.equal(capiUserData.city, "Jakarta Selatan");
  assert.equal(capiUserData.province, "DKI Jakarta");
  assert.equal(capiUserData.postal_code, "12430");
  assert.equal(capiUserData.country, "id");
});

test("every leg says Indonesia, in the case each platform asks for", async () => {
  // `id` here is a country, not an identifier: ISO 3166-1 alpha-2 for Indonesia.
  // Meta requires it lowercase ("use the lowercase, 2-letter country codes in
  // ISO 3166-1 alpha-2", customer information parameters, re-verified
  // 2026-08-28) and hashes it, so a full country name would produce a match key
  // for nobody and nothing would report the mistake. Google's
  // enhanced-conversions address wants the same country uppercase, unhashed.
  const run = await runTracker(
    {
      success: true,
      order_number: "INV-10042",
      payment_status: "unpaid",
      payment_method: "cod",
      is_paid: false,
      total_amount: 189_000,
    },
    { city: "Jakarta Selatan", province: "DKI Jakarta", postal_code: "12430" },
  );

  // Browser Pixel: SHA-256 of the lowercase alpha-2 code.
  assert.equal(run.pixelUserData?.country, await sha256Hex("id"));
  assert.notEqual(run.pixelUserData?.country, await sha256Hex("indonesia"));
  // Server CAPI: the same lowercase code, hashed server-side by meta-capi.ts.
  assert.equal(
    (run.postedPayloads[0].user_data as Record<string, unknown>).country,
    "id",
  );
  // Google enhanced conversions: same country, uppercase, unhashed.
  assert.match(
    TRACKER_SOURCE,
    /country:\s*'ID',/,
    "Google's address country must be the uppercase alpha-2 code",
  );
});

test("the confirmation page pulls the deferred pixel library forward instead of queueing behind its timer", async () => {
  // fbevents is deferred to first interaction or 2.5 s, measured at 2.7–3.2 s on
  // a live install. On /thanks the first interaction is the WhatsApp button, so
  // a Purchase queued in the fbq stub can lose the race with the buyer leaving.
  // `__PS_LOAD_GOOGLE_TAG__` has always existed for exactly this reason; the
  // Meta leg had no equivalent.
  const run = await runTracker({
    success: true,
    order_number: "INV-10042",
    payment_status: "unpaid",
    payment_method: "cod",
    is_paid: false,
    total_amount: 189_000,
  });

  assert.ok(
    run.pixelLoadPulledForward,
    "MetaThanksTracker must call __PS_LOAD_META_PIXEL__ rather than wait on the 2.5 s timer",
  );
  assert.deepEqual(
    run.trackedEvents,
    ["PageView", "Purchase"],
    "the deferred init must still emit PageView, and it must precede the Purchase",
  );
});

test("the thanks WhatsApp action keeps app handoff in the current browsing context", () => {
  const whatsappAnchor = THANKS_SOURCE.match(/<a\s+id="wa-confirm"[\s\S]*?<\/a>/)?.[0] ?? "";

  assert.ok(whatsappAnchor, "the thanks page must render its WhatsApp confirmation action");
  assert.doesNotMatch(
    whatsappAnchor,
    /target\s*=\s*["']_blank["']/,
    "wa.me must receive the current context so mobile can hand off without opening another tab",
  );
});

test("Purchase keeps one stable first-party external_id across Pixel and CAPI", async () => {
  const externalId = "0123456789abcdef0123456789abcdef";
  const run = await runTracker(
    {
      success: true,
      order_number: "INV-10042",
      payment_status: "unpaid",
      payment_method: "cod",
      is_paid: false,
      total_amount: 189_000,
    },
    {},
    `${META_EXTERNAL_ID_COOKIE}=${externalId}`,
  );

  assert.equal(run.pixelUserData?.external_id, await sha256Hex(externalId));
  const capiUserData = run.postedPayloads[0].user_data as Record<string, unknown>;
  assert.equal(capiUserData.external_id, externalId);
  assert.notEqual(run.pixelUserData?.external_id, capiUserData.external_id);
});

test("the duplicate guard is claimed only after both legs are dispatched", async () => {
  const orderStatus = {
    success: true,
    order_number: "INV-10042",
    payment_status: "unpaid",
    payment_method: "cod",
    is_paid: false,
    total_amount: 189_000,
  };

  const run = await runTracker(orderStatus);
  assert.deepEqual(
    run.guardKeys.sort(),
    ["meta_once_Purchase_INV-10042", "meta_once_Purchase_order_INV-10042"],
    "both guards must be recorded once the Purchase has gone out",
  );

  // A browser that refuses the write — Safari private mode throws on
  // localStorage.setItem — must still get its conversion out. The guard used to
  // be written *before* the dispatch and was not wrapped, so the throw killed
  // fire() ahead of both the Pixel and the CAPI post.
  const hostile = await runTracker(orderStatus, {}, "", { localStorageThrows: true });
  assert.equal(hostile.pixelEventIds.length, 1, "the Pixel Purchase must still fire");
  assert.equal(hostile.postedPayloads.length, 1, "the CAPI Purchase must still be posted");
});

test("a Purchase without a resolvable order number emits nothing at all", async () => {
  const run = await runTracker({
    success: true,
    order_number: "",
    payment_status: "unpaid",
    payment_method: "cod",
    is_paid: false,
    total_amount: 189_000,
  });

  assert.equal(run.pixelEventIds.length, 0, "no order number means no Pixel Purchase");
  assert.equal(run.postedPayloads.length, 0, "no order number means no CAPI Purchase");
});

test("no checkout form mints a random Purchase event_id any more", () => {
  for (const script of ["../scripts/form-hybrid.ts", "../scripts/form-middle.ts"]) {
    const source = readFileSync(new URL(script, import.meta.url), "utf8");
    assert.ok(
      !/createId\(`purchase_/.test(source),
      `${script} must not mint a Purchase event_id the server will never see`,
    );
    assert.ok(
      !/purchase_event_id/.test(source),
      `${script} must not carry a browser-minted purchase_event_id into thanks state`,
    );
  }
  const hybrid = readFileSync(
    new URL("../scripts/form-hybrid.ts", import.meta.url),
    "utf8",
  );
  assert.match(hybrid, /submit_token:\s*submitToken/);
  assert.doesNotMatch(
    hybrid,
    /submit_token:\s*`\$\{submitToken\}_\$\{eventId\}`/,
    "a funnel event id must not turn a retry into a new order identity",
  );
});

test("embed parent surfaces never emit Purchase before verified thanks", () => {
  const widgetSource = readFileSync(
    new URL("../../public/adsbook-form-widget.js", import.meta.url),
    "utf8",
  );

  const navigationSource = readFileSync(
    new URL("./checkout-navigation.ts", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(widgetSource, /["']Purchase["']/);
  assert.doesNotMatch(widgetSource, /adsbook:order-complete/);
  assert.doesNotMatch(navigationSource, /adsbook:order-complete/);
});
