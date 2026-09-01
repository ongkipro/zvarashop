/**
 * Google Ads click identifiers.
 *
 * In a COD funnel the real conversion happens days later, when the courier
 * collects cash — long after the browser session is gone. Uploading that sale
 * back to Google as an offline conversion requires the click id captured at
 * landing, so without this the delivered revenue can never be attributed and
 * Smart Bidding only ever learns from unconfirmed form submissions.
 *
 * Captured server-side from the ad landing URL into a first-party cookie, read
 * back at checkout (cookies ride along with the submit request — no form
 * plumbing), and stored on the order for later upload.
 */

export const CLICK_ID_COOKIE = "adsbook_click_ids";

/** Stable first-party visitor key shared by the Pixel and CAPI legs. */
export const META_EXTERNAL_ID_COOKIE = "adsbook_meta_external_id";

/**
 * Cookie name used before the AdsBookCMS rename. Read-only: an install upgraded
 * mid-campaign would otherwise drop up to 90 days of in-flight click ids that
 * can never be re-captured. Never written, so it ages out on its own.
 */
export const LEGACY_CLICK_ID_COOKIE = "zanoby_click_ids";

/** Click identifiers and attribution tags across Google, Meta, and UTMs. */
export const CLICK_ID_KEYS = [
  "gclid",
  "gbraid",
  "wbraid",
  "_fbp",
  "_fbc",
  "fbclid",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;
export type ClickIdKey = (typeof CLICK_ID_KEYS)[number];
export type ClickIds = Partial<Record<ClickIdKey, string>>;

export const AD_CLICK_KEYS = [
  "gclid",
  "gbraid",
  "wbraid",
  "fbclid",
  "_fbc",
  "_fbp",
] as const satisfies readonly ClickIdKey[];

export function hasAdClickId(ids: ClickIds): boolean {
  return AD_CLICK_KEYS.some((key) => Boolean(ids[key]));
}

/** Preserve paid attribution when a later visit carries only UTM campaign tags. */
export function mergeClickIds(stored: ClickIds, incoming: ClickIds): ClickIds {
  const merged = { ...stored, ...incoming };

  // Replace only the identifier family that received a new click. A later
  // Google click must not erase Meta's fbc/fbp, and a later Meta click must not
  // erase Google's gclid/gbraid/wbraid. Each ad platform needs its own last
  // attributable click when the order is confirmed days later.
  const googleKeys = ["gclid", "gbraid", "wbraid"] as const;
  const incomingGoogle = googleKeys.some((key) => Boolean(incoming[key]));
  if (incomingGoogle) {
    for (const key of googleKeys) {
      if (!incoming[key]) delete merged[key];
    }
  }

  const incomingMetaClick = Boolean(incoming.fbclid || incoming._fbc);
  if (incomingMetaClick) {
    if (!incoming.fbclid) delete merged.fbclid;
    if (!incoming._fbc) delete merged._fbc;
  }

  return merged;
}

// Click ids and tracking tokens are URL-safe strings up to 256 chars.
const CLICK_ID_PATTERN = /^[A-Za-z0-9._-]{1,256}$/;

export function parseClickIdsFromUrl(url: URL): ClickIds {
  const found: ClickIds = {};
  for (const key of CLICK_ID_KEYS) {
    const value = url.searchParams.get(key)?.trim();
    if (value && CLICK_ID_PATTERN.test(value)) found[key] = value;
  }
  if (found.fbclid && !found._fbc) {
    found._fbc = `fb.1.${Date.now()}.${found.fbclid}`;
  }
  return found;
}

export function serializeClickIds(ids: ClickIds): string {
  return JSON.stringify(ids);
}

/**
 * Tolerates anything: a missing cookie, truncated JSON, or a hand-edited value
 * yields an empty result rather than throwing inside the order path.
 */
export function parseClickIds(raw: string | null | undefined): ClickIds {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const found: ClickIds = {};
    for (const key of CLICK_ID_KEYS) {
      const value = parsed?.[key];
      if (typeof value === "string" && CLICK_ID_PATTERN.test(value)) {
        found[key] = value;
      }
    }
    return found;
  } catch {
    return {};
  }
}

export function readClickIdCookie(request: Request): ClickIds {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return {};
  const match =
    cookieHeader.match(new RegExp(`(?:^|;\\s*)${CLICK_ID_COOKIE}=([^;]+)`)) ||
    cookieHeader.match(new RegExp(`(?:^|;\\s*)${LEGACY_CLICK_ID_COOKIE}=([^;]+)`));
  if (!match) return {};
  try {
    return parseClickIds(decodeURIComponent(match[1]));
  } catch {
    return {};
  }
}

export function hasClickId(ids: ClickIds): boolean {
  return CLICK_ID_KEYS.some((key) => Boolean(ids[key]));
}

// fb.<subdomainIndex>.<timestamp>.<payload> — the shape Meta accepts. Kept in
// step with the identical pattern in `meta-event-contract.ts`, which guards the
// browser-supplied copy of the same two values.
const FB_BROWSER_ID_PATTERN = /^fb\.\d\.\d{10,20}\..+$/;
const META_EXTERNAL_ID_PATTERN = /^[a-f0-9]{32}$/;

export function isValidMetaBrowserId(value: unknown): value is string {
  return typeof value === "string" && FB_BROWSER_ID_PATTERN.test(value);
}

export function isValidMetaExternalId(value: unknown): value is string {
  return typeof value === "string" && META_EXTERNAL_ID_PATTERN.test(value);
}

function readCookieValue(cookieHeader: string, name: string): string | undefined {
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  if (!match) return undefined;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return undefined;
  }
}


/**
 * Meta's browser identifiers, read server-side.
 *
 * `_fbp` is written by `fbevents.js`; `_fbc` is written by the middleware the
 * moment an ad click lands with `fbclid`, and again by the pixel once it loads.
 * `externalId` is a random first-party key minted by `MetaPixelBase`. All three
 * are first-party on the storefront origin, so a same-origin request carries
 * them without the browser having to pass them in a body.
 *
 * Reading them here rather than in each tracker is what stops top-of-funnel
 * events from reaching Meta anonymous: `ViewContent` and `PageView` never sent
 * `user_data` at all, which on one live install was 96% of the CAPI volume. It
 * also survives the cases a browser read cannot — the pixel deferred, blocked,
 * or simply not loaded yet when the event fires.
 */
export function readMetaBrowserIds(
  request: Request,
): { externalId?: string; fbp?: string; fbc?: string } {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return {};
  // The click-id cookie is the fallback for `_fbc` alone: the middleware
  // synthesises it from `fbclid` at landing, so it exists on ad traffic even
  // before the pixel runs. `_fbp` has no such origin — only the pixel mints it.
  const clickIds = readClickIdCookie(request);
  const externalId = readCookieValue(cookieHeader, META_EXTERNAL_ID_COOKIE);
  const fbp = readCookieValue(cookieHeader, "_fbp");
  const directFbc = readCookieValue(cookieHeader, "_fbc");
  return {
    externalId:
      externalId && isValidMetaExternalId(externalId)
        ? externalId
        : undefined,
    fbp: fbp && isValidMetaBrowserId(fbp) ? fbp : undefined,
    fbc:
      directFbc && isValidMetaBrowserId(directFbc)
        ? directFbc
        : clickIds._fbc && isValidMetaBrowserId(clickIds._fbc)
          ? clickIds._fbc
          : undefined,
  };
}

/**
 * Attribution persisted with an order.
 *
 * The click-id cookie is written on the landing response, while `_fbp` is
 * normally created later by the Pixel bootstrap. Reading both sources at the
 * checkout boundary prevents the delayed paid-order Purchase from losing the
 * newer browser ID.
 */
export function readOrderClickIds(request: Request): ClickIds {
  const clickIds = readClickIdCookie(request);
  const browserIds = readMetaBrowserIds(request);
  return {
    ...clickIds,
    ...(browserIds.fbp ? { _fbp: browserIds.fbp } : {}),
    ...(browserIds.fbc ? { _fbc: browserIds.fbc } : {}),
  };
}
