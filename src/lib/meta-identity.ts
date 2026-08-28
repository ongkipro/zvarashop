/**
 * The identity normalisation both Meta legs must agree on.
 *
 * A Purchase reaches Meta twice — once from the browser Pixel and once from the
 * server Conversions API — and the two are deduplicated by `event_id`. The match
 * keys are not deduplicated: Meta hashes what it is given, so if the two legs
 * normalise a person differently they describe two different people, and a hash
 * always *looks* correct while matching nothing.
 *
 * Meta's own rules, verified against the customer information parameters
 * documentation on 2026-08-19:
 *
 *   em      trim, lowercase
 *   fn, ln  lowercase, no punctuation
 *   ct, st  lowercase, no punctuation, no spaces
 *   zp      lowercase, no spaces, no dash
 *   ph      digits in E.164, no separators
 *   country lowercase ISO 3166-1 alpha-2 (ID for Indonesia)
 *
 * This module exists so there is exactly one implementation to keep correct.
 * `MetaThanksTracker.astro` cannot import it — `define:vars` forces `is:inline`,
 * which is never bundled — so it carries a copy, and `meta-identity.test.ts`
 * fails if that copy drifts.
 */

/** Lowercase, strip everything that is not a letter or digit. */
export function normalizeMetaText(value?: string): string | undefined {
  const cleaned = value?.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  return cleaned || undefined;
}

/**
 * Indonesian storefront input is `08xxx`; a Meta profile stores `628xxx`. Also
 * handles the `+62`/`0062` and bare `8xxx` forms a customer may type, because
 * the browser leg previously normalised only the leading zero and hashed the
 * rest verbatim — a guaranteed miss against the server leg.
 */
export function toE164Digits(value?: string): string | undefined {
  let digits = value?.replace(/\D/g, "") || "";
  if (!digits) return undefined;
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("620")) digits = `62${digits.slice(3)}`;
  else if (digits.startsWith("0")) digits = `62${digits.slice(1)}`;
  else if (digits.startsWith("8")) digits = `62${digits}`;
  return digits.length >= 8 && digits.length <= 15 ? digits : undefined;
}

/** Meta wants `fn` as the first name alone and `ln` as everything after it. */
export function metaNameParts(value?: string): {
  firstName?: string;
  lastName?: string;
} {
  const parts = value?.trim().split(/\s+/).filter(Boolean) ?? [];
  return {
    firstName: normalizeMetaText(parts[0]),
    lastName:
      parts.length > 1 ? normalizeMetaText(parts.slice(1).join("")) : undefined,
  };
}

/** SHA-256, lower-hex. `crypto.subtle` is global in both the browser and the
 *  Cloudflare Workers runtime, so this one implementation serves the browser
 *  Pixel leg and the server CAPI leg alike. */
export async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * There is no shared "advanced matching builder" any more, and there must not be
 * one: fbevents applies `fbq('init', pixelId, advancedMatching)` exactly once
 * per page, so anything that hashes a buyer *after* the Pixel bootstrap is work
 * thrown away. The one page that knows its buyer at bootstrap time — `/thanks` —
 * builds the object inline in `MetaThanksTracker.astro` and hands it to
 * `__PS_META_INIT__`; the checkout forms send late identity to the CAPI leg
 * instead. The builder that used to live here also emitted `client_user_agent`,
 * which is a Conversions API field and not a Pixel match key at all — the live
 * library stores it on `userData` without a censored-format entry, so it was
 * never counted as one.
 */
