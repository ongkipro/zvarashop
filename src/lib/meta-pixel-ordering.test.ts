import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { resolveMetaCountry } from "./meta-identity.ts";

/**
 * Two defects that only appear where one file meets another, so each is
 * asserted against the real shipped source rather than a restatement of it.
 *
 * 1. fbq ordering. `fbq`'s stub queues by arrival order and fbevents replays
 *    the queue in that order. A `track` replayed ahead of the pixel's `init`
 *    is dropped — "You must call fbq('init', …) before tracking events" — so
 *    the ViewContent browser leg silently stopped existing while its CAPI twin
 *    kept arriving, which is exactly the shape no dashboard shows you.
 *
 * 2. `country`. Validated by the contract, hashed by `meta-capi`, sent by the
 *    `/thanks` browser leg — and dropped by the route that carries every
 *    first-party event.
 */

const inlineScript = (path: string, label: string) => {
  const source = readFileSync(new URL(path, import.meta.url), "utf8");
  const match = source.match(/<script\b[^>]*\bis:inline\b[^>]*>([\s\S]*)<\/script>/);
  assert.ok(match, `${label} must keep its inline script`);
  return match[1];
};

const PIXEL_BASE = inlineScript(
  "../components/storefront/tracking/MetaPixelBase.astro",
  "MetaPixelBase",
);
const VIEW_CONTENT = inlineScript(
  "../components/storefront/tracking/MetaViewContentTracker.astro",
  "MetaViewContentTracker",
);
const LANDING = inlineScript(
  "../components/storefront/tracking/MetaLandingTracker.astro",
  "MetaLandingTracker",
);

/**
 * One tick, no yielding. `astro.config.mjs` sets
 * `build.inlineStylesheets: 'always'`, so no render-blocking stylesheet
 * separates the head bootstrap from the body tracker and this is the ordering
 * a real browser gets — not a pathological worst case.
 */
async function replayPixelThenTracker(trackerScript: string) {
  const calls: string[] = [];
  const win: Record<string, unknown> = {
    location: { protocol: "https:", href: "https://toko.test/produk/x", pathname: "/produk/x", search: "" },
    addEventListener: () => {},
    setTimeout: () => 0,
    dataLayer: [],
  };
  const doc = {
    cookie: "",
    title: "Produk X",
    head: { appendChild: () => {} },
    createElement: () => ({}),
  };
  const noopFetch = () => Promise.resolve({ json: () => Promise.resolve({}) });

  new Function("window", "document", "setTimeout", "fetch", "pixelId", "metaExternalIdCookie", PIXEL_BASE)(
    win, doc, () => 0, noopFetch, "1234567890", "adsbook_meta_external_id",
  );

  const stubbed = win.fbq as (...args: unknown[]) => unknown;
  win.fbq = (...args: unknown[]) => {
    calls.push(`${args[0]}:${args[1]}`);
    return stubbed(...args);
  };

  new Function(
    "window", "document", "setTimeout", "fetch",
    "slug", "contentId", "contentName", "price", "checkoutSelector",
    trackerScript,
  )(win, doc, () => 0, noopFetch, "x", "100001", "Produk X", 1000, "#checkout");

  // Wait for the init the external-ID digest gates, rather than for a fixed
  // number of ticks: `crypto.subtle.digest` resolves on its own schedule, and
  // a tick count that is usually enough is a flaky test, not a fast one.
  const deadline = Date.now() + 2000;
  while (!calls.some((call) => call.startsWith("init:")) && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
  // One more turn so anything queued behind the init has been replayed too.
  await new Promise((resolve) => setTimeout(resolve, 5));
  return calls;
}

test("a product-page ViewContent is never replayed ahead of the pixel init", async () => {
  const calls = await replayPixelThenTracker(VIEW_CONTENT);
  assert.ok(calls.includes("track:ViewContent"), "ViewContent must still reach the browser leg");
  assert.ok(
    calls.indexOf("init:1234567890") < calls.indexOf("track:ViewContent"),
    `init must precede ViewContent, got ${calls.join(" -> ")}`,
  );
});

test("a landing-page ViewContent is never replayed ahead of the pixel init", async () => {
  const calls = await replayPixelThenTracker(LANDING);
  assert.ok(
    calls.indexOf("init:1234567890") < calls.indexOf("track:ViewContent"),
    `init must precede ViewContent, got ${calls.join(" -> ")}`,
  );
});

test("no tracker reaches fbq('track') around the ordered hook", () => {
  for (const [label, script] of [
    ["MetaViewContentTracker", VIEW_CONTENT],
    ["MetaLandingTracker", LANDING],
    ["MetaThanksTracker", inlineScript("../components/storefront/tracking/MetaThanksTracker.astro", "MetaThanksTracker")],
  ] as const) {
    assert.doesNotMatch(
      script,
      /window\.fbq\(\s*['"]track['"]/,
      `${label} must track through __PS_META_TRACK__, not fbq directly`,
    );
    assert.match(script, /__PS_META_TRACK__\(/, `${label} must use the ordered track hook`);
  }
});

test("country is an Indonesian order's key, the edge country otherwise, and never a guess", () => {
  assert.equal(resolveMetaCountry(undefined, "SG", true), "id", "a resolved order is domestic");
  assert.equal(resolveMetaCountry("us", "SG", true), "id", "the order outranks a caller claim");
  assert.equal(resolveMetaCountry(undefined, "SG", false), "sg", "the edge country is truthful");
  assert.equal(resolveMetaCountry("id", null, false), "id", "a validated claim is honoured");
  // A hash of a non-country matches nobody, and Meta scores match quality on
  // the keys it was given — an absent key is strictly better than a wrong one.
  assert.equal(resolveMetaCountry(undefined, "XX", false), undefined, "Cloudflare's unknown");
  assert.equal(resolveMetaCountry(undefined, "T1", false), undefined, "Cloudflare's Tor");
  assert.equal(resolveMetaCountry(undefined, "indonesia", false), undefined, "not alpha-2");
  assert.equal(resolveMetaCountry(undefined, null, false), undefined, "nothing to say");
});

test("both CAPI ingestion routes forward country to the outbox", () => {
  const routes = [
    ["src/pages/api/meta-event.ts", "../pages/api/meta-event.ts"],
    ["src/pages/api/v1/tracking/events.ts", "../pages/api/v1/tracking/events.ts"],
  ] as const;
  for (const [label, path] of routes) {
    const source = readFileSync(new URL(path, import.meta.url), "utf8");
    const userData = source.slice(source.indexOf("userData: {"), source.indexOf("customData: {"));
    assert.match(
      userData,
      /country:\s*resolveMetaCountry\(/,
      `${label} builds user_data without country — the Pixel leg sends it and this leg would not`,
    );
  }
});
