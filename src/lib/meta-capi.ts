import { metaNameParts, normalizeMetaText, sha256Hex, toE164Digits } from './meta-identity.ts';
/**
 * Pinned in one place so a bump is a one-line change, never a grep across
 * trackers. Meta ships a version roughly quarterly and retires each after about
 * two years — re-check the changelog before bumping, do not guess:
 * https://developers.facebook.com/docs/graph-api/changelog
 *
 * Verified current on 2026-08-14 (v26.0, released 2026-07-29).
 */
export const META_GRAPH_API_VERSION = 'v26.0';

export { toE164Digits } from './meta-identity.ts';

export type MetaUserData = {
  phone?: string;
  name?: string;
  email?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  externalId?: string;
  /** Meta's own cookies. Forwarded raw — hashing them breaks matching. */
  fbp?: string;
  fbc?: string;
  clientIp?: string;
  userAgent?: string;
};

export type MetaCustomData = {
  contentName?: string;
  contentIds?: string[];
  contentType?: string;
  value?: number;
  currency?: string;
  /** Canonical order number. Required for Purchase event deduplication. */
  orderNumber?: string;
};

/** Meta matches on lowercased, punctuation-free text. */
function hashText(value?: string) {
  const cleaned = normalizeMetaText(value);
  return cleaned ? sha256Hex(cleaned) : undefined;
}

function hashEmail(value?: string) {
  const cleaned = value?.trim().toLowerCase();
  return cleaned ? sha256Hex(cleaned) : undefined;
}

function hashPhone(value?: string) {
  const digits = toE164Digits(value);
  return digits ? sha256Hex(digits) : undefined;
}

function hashFirstName(value?: string) {
  const { firstName } = metaNameParts(value);
  return firstName ? sha256Hex(firstName) : undefined;
}

function hashLastName(value?: string) {
  const { lastName } = metaNameParts(value);
  return lastName ? sha256Hex(lastName) : undefined;
}

function cleanRawSignal(value?: string): string | undefined {
  const cleaned = value?.trim();
  return cleaned || undefined;
}

function cleanClientIp(value?: string): string | undefined {
  const cleaned = cleanRawSignal(value);
  return cleaned?.toLowerCase() === 'unknown' ? undefined : cleaned;
}

export function resolveMetaEventId(
  eventName: string,
  eventId: string,
  orderNumber?: string,
): string | undefined {
  const resolved = eventName === 'Purchase' ? orderNumber : eventId;
  return cleanRawSignal(resolved);
}

function readMetaErrorMessage(responseBody: unknown): string | undefined {
  if (!responseBody || typeof responseBody !== 'object' || !('error' in responseBody)) return undefined;
  const error = responseBody.error;
  if (!error || typeof error !== 'object' || !('message' in error)) return undefined;
  return typeof error.message === 'string' && error.message.trim() ? error.message : undefined;
}

/**
 * Is this ID actually a pixel?
 *
 * A digit check is not one. `^\d{5,25}$` accepts a Business Manager ID, an ad
 * account, a page — and on 2026-09-03 an operator saved a Business ID into the
 * Pixel ID field. Both legs died instantly and neither said so: `POST
 * /{business}/events` returns "Object with ID … does not exist, cannot be
 * loaded due to missing permissions, or does not support this operation", which
 * reads like an auth problem and is not; and the browser beacon endpoint
 * validates no ID at all, so `facebook.com/tr` accepted every event and
 * discarded it silently. The outage ran for two days and was found by reading
 * Graph API error codes, not by anything the system reported.
 *
 * The discriminator is which error Meta returns for a field that exists only on
 * an AdsPixel:
 *
 * - `200` — the object resolves and the field exists; this is a pixel.
 * - `100` "nonexisting field" — the object resolves but has no such field, so
 *   it is some other node type. This is the case worth refusing.
 * - `100/33` — the object does not resolve for this token at all. That is
 *   genuinely ambiguous between "wrong ID" and "no permission", so it is
 *   reported as unknown rather than guessed at.
 *
 * Anything inconclusive — a network failure, a permission error, a shape Meta
 * has not documented — returns `unknown`. A verification that cannot reach Meta
 * must never block an operator from saving a credential.
 */
export type MetaPixelIdentity =
  | { state: "pixel"; name?: string }
  | { state: "not-a-pixel"; name?: string }
  | { state: "unknown"; reason: string };

/** Present only on an AdsPixel node, and cheap to ask for. */
const PIXEL_ONLY_FIELD = "last_fired_time";

export async function verifyMetaPixelIdentity(
  pixelId: string,
  accessToken: string,
  fetchImpl: typeof fetch = fetch,
): Promise<MetaPixelIdentity> {
  const ask = async (fields: string) => {
    const url = new URL(`https://graph.facebook.com/${META_GRAPH_API_VERSION}/${pixelId}`);
    url.searchParams.set("fields", fields);
    url.searchParams.set("access_token", accessToken);
    const response = await fetchImpl(url);
    return {
      ok: response.ok,
      body: (await response.json().catch(() => null)) as {
        name?: string;
        error?: { code?: number; error_subcode?: number; message?: string };
      } | null,
    };
  };

  try {
    const probe = await ask(`id,name,${PIXEL_ONLY_FIELD}`);
    if (probe.ok) return { state: "pixel", name: probe.body?.name };

    const error = probe.body?.error;
    if (error?.code !== 100) {
      return { state: "unknown", reason: error?.message ?? "Meta tidak memberi jawaban yang dikenali." };
    }
    // Subcode 33 is "cannot be loaded", which a missing asset permission also
    // produces. Refusing on it would block a correct ID behind a fixable
    // permission problem.
    if (error.error_subcode === 33) {
      return { state: "unknown", reason: error.message ?? "Objek tidak terjangkau oleh token ini." };
    }
    if (!/nonexisting field/i.test(error.message ?? "")) {
      return { state: "unknown", reason: error.message ?? "Meta menolak pemeriksaan ID." };
    }
    // The object resolves and is not a pixel. Name it if Meta will say.
    const named = await ask("id,name");
    return { state: "not-a-pixel", name: named.ok ? named.body?.name : undefined };
  } catch (error) {
    return {
      state: "unknown",
      reason: error instanceof Error ? error.message : "Pemeriksaan ID gagal dihubungi.",
    };
  }
}

export async function sendMetaCapiEvent(
  eventName: string,
  eventId: string,
  eventSourceUrl: string,
  userData: MetaUserData,
  customData: MetaCustomData,
  pixelId?: string,
  accessToken?: string,
  testEventCode?: string,
  /** Unix seconds stamped when the event happened; retries must preserve it. */
  eventTime?: number,
): Promise<{
  success: boolean;
  response?: unknown;
  reason?: string;
}> {
  const resolvedEventId = resolveMetaEventId(eventName, eventId, customData.orderNumber);
  if (!resolvedEventId) {
    return {
      success: false,
      reason: eventName === 'Purchase'
        ? 'Purchase membutuhkan order_number sebagai event_id.'
        : 'Meta event_id tidak boleh kosong.',
    };
  }

  const clientIp = cleanClientIp(userData.clientIp);
  const userAgent = cleanRawSignal(userData.userAgent);
  const fbp = cleanRawSignal(userData.fbp);
  const fbc = cleanRawSignal(userData.fbc);
  const orderNumber = cleanRawSignal(customData.orderNumber);
  const targetPixelId = pixelId || import.meta.env.META_PIXEL_ID;
  const targetToken = accessToken || import.meta.env.META_CAPI_ACCESS_TOKEN;

  if (!targetPixelId || !targetToken) {
    return { success: false, reason: 'META_PIXEL_ID or META_CAPI_ACCESS_TOKEN not set' };
  }

  const [ph, em, fn, ln, ct, st, zp, country, external_id] = await Promise.all([
    hashPhone(userData.phone),
    hashEmail(userData.email),
    hashFirstName(userData.name),
    hashLastName(userData.name),
    hashText(userData.city),
    hashText(userData.province),
    hashText(userData.postalCode),
    hashText(userData.country),
    hashText(userData.externalId),
  ]);

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: eventTime ?? Math.floor(Date.now() / 1000),
        event_id: resolvedEventId,
        event_source_url: eventSourceUrl,
        action_source: 'website',
        user_data: {
          ph: ph ? [ph] : undefined,
          em: em ? [em] : undefined,
          fn: fn ? [fn] : undefined,
          ln: ln ? [ln] : undefined,
          ct: ct ? [ct] : undefined,
          st: st ? [st] : undefined,
          zp: zp ? [zp] : undefined,
          country: country ? [country] : undefined,
          external_id: external_id ? [external_id] : undefined,
          fbp,
          fbc,
          client_ip_address: clientIp,
          client_user_agent: userAgent,
        },
        // `content_type` describes `content_ids`; sent without them it is a
        // claim about nothing, and Events Manager reports it as a malformed
        // parameter on every PageView. Nothing sets `contentType`, so this
        // previously stamped `product` on every event the store emitted.
        custom_data: {
          content_name: customData.contentName,
          content_ids: customData.contentIds,
          content_type: customData.contentIds?.length
            ? customData.contentType || 'product'
            : undefined,
          value: customData.value,
          currency: customData.currency || 'IDR',
          order_id: orderNumber,
        },
      },
    ],
    test_event_code: testEventCode || undefined,
  };

  const endpoint = `https://graph.facebook.com/${META_GRAPH_API_VERSION}/${targetPixelId}/events?access_token=${targetToken}`;
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const responseBody: unknown = await response.json().catch(() => null);
    const errorMessage = readMetaErrorMessage(responseBody);
    return {
      success: response.ok,
      response: responseBody,
      reason: response.ok
        ? undefined
        : errorMessage || `Meta CAPI HTTP ${response.status}.`,
    };
  } catch (error) {
    return {
      success: false,
      reason: error instanceof Error ? error.message : 'Meta CAPI network error.',
    };
  }
}
