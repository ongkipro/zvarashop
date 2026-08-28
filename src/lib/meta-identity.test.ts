import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  isSyntheticBuyerEmail,
  metaNameParts,
  normalizeMetaText,
  sha256Hex,
  toE164Digits,
} from "./meta-identity.ts";

const THANKS_TRACKER = readFileSync(
  "src/components/storefront/tracking/MetaThanksTracker.astro",
  "utf8",
);
const PIXEL_BASE = readFileSync(
  "src/components/storefront/tracking/MetaPixelBase.astro",
  "utf8",
);
const GOOGLE_ADS_BASE = readFileSync(
  "src/components/storefront/tracking/GoogleAdsBase.astro",
  "utf8",
);

test("a phone reaches Meta as E.164 digits whichever way the buyer typed it", () => {
  // Every one of these is a real Indonesian checkout input. Before this module
  // the browser leg converted only the leading zero, so `8...` and `+62...`
  // hashed to something the server leg never produced.
  assert.equal(toE164Digits("081234567890"), "6281234567890");
  assert.equal(toE164Digits("81234567890"), "6281234567890");
  assert.equal(toE164Digits("+62 812-3456-7890"), "6281234567890");
  assert.equal(toE164Digits("006281234567890"), "6281234567890");
  assert.equal(toE164Digits("62081234567890"), "6281234567890");
  assert.equal(toE164Digits("0812"), undefined);
  assert.equal(toE164Digits(""), undefined);
});

test("Meta name parts are lowercased and stripped of punctuation", () => {
  assert.deepEqual(metaNameParts("Budi Santoso"), {
    firstName: "budi",
    lastName: "santoso",
  });
  assert.deepEqual(metaNameParts("  Siti   Nur Aisyah "), {
    firstName: "siti",
    lastName: "nuraisyah",
  });
  assert.deepEqual(metaNameParts("Andi"), {
    firstName: "andi",
    lastName: undefined,
  });
  assert.deepEqual(metaNameParts("O'Brien Jr."), {
    firstName: "obrien",
    lastName: "jr",
  });
  assert.equal(normalizeMetaText("  Jakarta Selatan  "), "jakartaselatan");
  assert.equal(normalizeMetaText("   "), undefined);
});

test("the inline thanks tracker normalises identically to this module", () => {
  // `define:vars` forces `is:inline`, which Astro never bundles, so the tracker
  // carries a copy of these rules. A copy that drifts sends Meta two different
  // people for one purchase, and no type or runtime error would ever say so.
  for (const branch of [
    "digits.startsWith('00')",
    "digits.startsWith('620')",
    "digits.startsWith('0')",
    "digits.startsWith('8')",
    "digits.length >= 8 && digits.length <= 15",
    "replace(/[^a-z0-9]/g, '')",
  ]) {
    assert.ok(
      THANKS_TRACKER.includes(branch),
      `MetaThanksTracker.astro lost the normalisation branch ${branch}`,
    );
  }
});

test("sha256Hex hashes to lower-hex and never returns the input verbatim", async () => {
  const hash = await sha256Hex("6281234567890");
  assert.match(hash, /^[a-f0-9]{64}$/);
  assert.notEqual(hash, "6281234567890");
});

test("the Pixel bootstrap mints and hashes one stable first-party external ID", async () => {
  const match = PIXEL_BASE.match(
    /<script\b[^>]*\bis:inline\b[^>]*>([\s\S]*)<\/script>/,
  );
  assert.ok(match, "MetaPixelBase must keep its inline bootstrap");

  let cookie = "";
  const documentStub = {
    get cookie() {
      return cookie;
    },
    set cookie(value: string) {
      cookie = value.split(";")[0];
    },
    createElement: () => ({}),
    head: { appendChild: () => undefined },
  };
  const calls: unknown[][] = [];
  const tracked = Promise.withResolvers<void>();
  const windowStub: Record<string, any> = {
    location: { protocol: "https:" },
    addEventListener: () => undefined,
    setTimeout: () => 1,
    fbq: (...args: unknown[]) => {
      calls.push(args);
      if (args[0] === "track") tracked.resolve();
    },
  };
  const bootstrap = new Function(
    "pixelId",
    "metaExternalIdCookie",
    "window",
    "document",
    "crypto",
    "TextEncoder",
    "Uint8Array",
    match[1],
  );

  bootstrap(
    "1234567890",
    "adsbook_meta_external_id",
    windowStub,
    documentStub,
    globalThis.crypto,
    TextEncoder,
    Uint8Array,
  );
  await tracked.promise;

  const externalId = cookie.split("=")[1];
  assert.match(externalId, /^[a-f0-9]{32}$/);
  const init = calls.find((args: unknown[]) => args[0] === "init");
  const pageView = calls.find((args: unknown[]) => args[0] === "track");
  const initData = init?.[2] as Record<string, unknown> | undefined;
  const pageViewOptions = pageView?.[3] as Record<string, unknown> | undefined;
  assert.match(String(initData?.external_id ?? ""), /^[a-f0-9]{64}$/);
  assert.equal(initData?.external_id, await sha256Hex(externalId));
  assert.equal(pageViewOptions?.eventID, windowStub.__META_PAGEVIEW_EVENT_ID__);
});

test("the payment provider's minted address never becomes a match key", () => {
  // `buyerEmail()` mints `<phone digits>@<store host>` so an online payment
  // provider has an address to accept, and it is stored on the order. It was
  // being read straight into the CAPI leg's `em`: two of this install's orders
  // already carry one. Nobody owns that address, and Meta scores match quality
  // on the keys it is given, so supplying it is worse than omitting it.
  assert.equal(isSyntheticBuyerEmail("6281234567890@zvara.shop", "6281234567890"), true);
  // Stored in either form, through the same normaliser both legs use.
  assert.equal(isSyntheticBuyerEmail("081234567890@zvara.shop", "6281234567890"), true);
  assert.equal(isSyntheticBuyerEmail("6281234567890@zvara.shop", "081234567890"), true);

  // A real address survives, including one whose local part is digits but is
  // not this buyer's number — dropping that would be inventing a rule.
  assert.equal(isSyntheticBuyerEmail("budi.santoso@gmail.com", "6281234567890"), false);
  assert.equal(isSyntheticBuyerEmail("123456789@gmail.com", "6281234567890"), false);
  assert.equal(isSyntheticBuyerEmail(undefined, "6281234567890"), false);
  assert.equal(isSyntheticBuyerEmail("6281234567890@zvara.shop", undefined), false);
});

test("the CAPI route sends the resolved email through that guard, not around it", () => {
  // One guard at the boundary where both halves of the pair are known. Placing
  // it on the resolved value also covers the headless route's payload.email.
  const route = readFileSync("src/pages/api/meta-event.ts", "utf8");
  assert.match(route, /isSyntheticBuyerEmail\(resolvedEmail,\s*resolvedPhone\)/);
  assert.doesNotMatch(
    route,
    /email:\s*purchaseOrder\?\.customer_email\s*\|\|\s*payload\.email/,
    "the raw order email must not reach userData unguarded",
  );
});

test("MetaPixelBase is the only file allowed to call fbq('init')", () => {
  // fbevents honours `init` for a pixel id exactly once and silently ignores
  // every later call. Three files used to call it — the pixel bootstrap, and
  // then both checkout scripts and the thanks tracker behind it — so every
  // advanced-matching object any of them built after page load was discarded.
  // Nothing errored: the pixel kept firing events, matched on `external_id`
  // alone, while the CAPI leg carried seven keys for the same person.
  // Whole-line comments only: these files explain the rule in prose that quotes
  // the very call being banned, and a stripper clever enough to also handle
  // trailing comments would start eating `https://` out of string literals.
  const withoutComments = (source: string) =>
    source
      .split("\n")
      .filter((line) => !/^\s*(\/\/|\/?\*)/.test(line))
      .join("\n");

  const trackingSources = [
    "src/components/storefront/tracking/MetaThanksTracker.astro",
    "src/components/storefront/tracking/MetaLandingTracker.astro",
    "src/components/storefront/tracking/MetaViewContentTracker.astro",
    "src/components/storefront/tracking/MetaPageViewTracker.astro",
    "src/scripts/form-hybrid.ts",
    "src/scripts/form-middle.ts",
  ];
  for (const path of trackingSources) {
    assert.doesNotMatch(
      withoutComments(readFileSync(path, "utf8")),
      /fbq\(\s*["']init["']/,
      `${path} must hand advanced matching to __PS_META_INIT__, not re-init the pixel`,
    );
  }
  const baseInits = withoutComments(PIXEL_BASE).match(/fbq\(\s*["']init["']/g) ?? [];
  assert.equal(
    baseInits.length,
    2,
    "MetaPixelBase owns the single init — one call with user data, one without",
  );
});

test("the confirmation page's advanced matching reaches the pixel through the one init", () => {
  // The CAPI leg (postMeta's user_data, further down MetaThanksTracker) has
  // always sent ct/st/zp/country for Purchase. The browser Pixel must describe
  // the same person with the same keys, and the only call fbevents honours is
  // MetaPixelBase's — so the tracker contributes to it rather than repeating it.
  const handover = THANKS_TRACKER.slice(
    THANKS_TRACKER.indexOf("const advancedMatching = {"),
    THANKS_TRACKER.indexOf("window.__PS_META_INIT__(advancedMatching)"),
  );
  assert.ok(handover, "MetaThanksTracker must build advanced matching for __PS_META_INIT__");
  for (const key of ["ph:", "fn:", "ln:", "ct:", "st:", "zp:", "country:", "external_id:"]) {
    assert.ok(
      handover.includes(key),
      `MetaThanksTracker.astro's advanced matching is missing ${key}`,
    );
  }
  // A Conversions API field, not a Pixel match key: the live library stores it
  // on `userData` with no censored-format entry, so it counts for nothing.
  assert.doesNotMatch(
    THANKS_TRACKER,
    /client_user_agent/,
    "client_user_agent belongs to the CAPI leg, which derives it server-side",
  );
  // `/thanks` is what makes the base wait for these hashes; without the flag the
  // base initialises on external_id alone and the handover arrives too late.
  assert.match(
    readFileSync("src/pages/thanks.astro", "utf8"),
    /__PS_META_AWAIT_MATCHING__\s*=\s*true/,
    "thanks.astro must declare __PS_META_AWAIT_MATCHING__ before MetaPixelBase runs",
  );
});

test("both ad libraries give a conversion a way past their deferral timer", () => {
  // gtag.js and fbevents.js are both deferred to first interaction or 2.5 s.
  // On /thanks the first interaction is the WhatsApp hand-off, so a conversion
  // that waits for the timer can lose the race with the buyer leaving. The
  // Google leg has had this escape hatch since its deferral shipped; the Meta
  // leg did not, and its Purchase sat in the fbq queue.
  assert.match(GOOGLE_ADS_BASE, /window\.__PS_LOAD_GOOGLE_TAG__\s*=\s*loadGtag/);
  assert.match(PIXEL_BASE, /window\.__PS_LOAD_META_PIXEL__\s*=\s*loadPixel/);
  assert.match(
    THANKS_TRACKER,
    /window\.__PS_LOAD_META_PIXEL__\(\)/,
    "the confirmation page must pull fbevents forward instead of queueing behind its timer",
  );
});

test("Google enhanced conversions call `set` before `event`, not a nested user_data param", () => {
  // Verified 2026-08-24 against support.google.com/google-ads/answer/13258081:
  // the documented shape is a standalone `gtag('set', 'user_data', {...})`
  // ahead of the conversion event, not a `user_data` key folded into the
  // event's own payload. The previous code did the latter, which is not the
  // shape Google's own docs describe.
  const setCallIndex = GOOGLE_ADS_BASE.indexOf("gtag('set', 'user_data', userData)");
  const eventCallIndex = GOOGLE_ADS_BASE.indexOf("gtag('event', 'conversion', payload)");
  assert.ok(setCallIndex >= 0, "GoogleAdsBase.astro must call gtag('set', 'user_data', ...)");
  assert.ok(eventCallIndex >= 0, "GoogleAdsBase.astro must still fire the conversion event");
  assert.ok(setCallIndex < eventCallIndex, "user_data must be set before the conversion event fires");
  assert.doesNotMatch(
    GOOGLE_ADS_BASE,
    /payload\.user_data/,
    "user_data must not be nested inside the conversion event payload any more",
  );
});

test("Google enhanced-conversion names are nested where gtag reads them", () => {
  // Sent at the top level of `user_data`, gtag ignores them: the hashing cost is
  // paid and nobody is matched. They belong inside `address`, beside the
  // unhashed postal code and country.
  assert.match(
    THANKS_TRACKER,
    /address:\s*\{[\s\S]{0,400}?sha256_first_name/,
    "Google first name must sit inside user_data.address",
  );
  assert.match(
    THANKS_TRACKER,
    /address:\s*\{[\s\S]{0,900}?country:\s*'ID'/,
    "Google address match key needs an uppercase ISO country code beside the hashed name",
  );
  // Google trims and lowercases; it does not strip punctuation, so a multi-word
  // family name must keep its space here even though Meta removes it.
  assert.ok(
    THANKS_TRACKER.includes("nameParts.slice(1).join(' ')"),
    "Google last name must keep the space Meta strips",
  );
});
