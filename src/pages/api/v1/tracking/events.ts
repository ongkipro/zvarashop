import type { APIRoute } from 'astro';
import { handleOptions, headlessError, headlessOk, validateHeadlessRequest } from '../../../../lib/headless-api';
import { validateMetaEventPayload } from '../../../../lib/meta-event-contract';
import { getStoreAdsConfig } from '../../../../lib/store-ads';
import { getRuntimeEnv } from '../../../../lib/env';
import { getClientIp } from '../../../../lib/rate-limit';
import { enqueueCapiEvent, deliverCapiEvent, drainCapiOutbox } from '../../../../lib/capi-outbox';
import { findPurchaseOrderForApiKeyCaller, resolveMetaPurchaseContentIds } from '../../../../lib/meta-purchase-order';
import { toE164Digits } from '../../../../lib/meta-capi';
import { isSyntheticBuyerEmail, resolveMetaCountry } from '../../../../lib/meta-identity';
import { parseClickIds } from '../../../../lib/click-ids';
import { parseMetaOrderContext } from '../../../../lib/meta-order-context';

export const prerender = false;

export const OPTIONS = handleOptions;

export const POST: APIRoute = async ({ request, locals }) => {
  const validation = await validateHeadlessRequest(request, locals, { operation: 'trackingCreate' });
  if (!validation.allowed) {
    return validation.errorResponse;
  }

  try {
    const rawPayload = await request.json().catch(() => null);
    const validated = validateMetaEventPayload(rawPayload, request.url, validation.origin);
    if (!validated.ok) {
      return validation.finalize(headlessError(validated.error, 400, {
        code: 'INVALID_TRACKING_PAYLOAD',
      }, validation.corsHeaders));
    }

    const payload = validated.value;
    const adsConfig = await getStoreAdsConfig(locals);
    if (!adsConfig.metaPixelId || !adsConfig.metaCapiToken) {
      return validation.finalize(headlessOk(
        {
          skipped: true,
          reason: 'Tracking pixel/CAPI belum dikonfigurasi untuk toko ini.',
        },
        200,
        validation.corsHeaders
      ));
    }

    const database = getRuntimeEnv(locals)?.OMS_DB as D1Database | undefined;
    if (!database?.prepare) {
      return validation.finalize(headlessError('Database tracking event store belum dikonfigurasi.', 503, {
        code: 'DATABASE_UNAVAILABLE',
      }, validation.corsHeaders));
    }

    const purchaseOrder = payload.eventName === 'Purchase'
      ? await findPurchaseOrderForApiKeyCaller(database, payload.eventId)
      : null;
    if (payload.eventName === 'Purchase' && !purchaseOrder) {
      return validation.finalize(headlessError(
        'Purchase event_id harus berupa order_number yang tercatat.',
        404,
        { code: 'PURCHASE_ORDER_NOT_FOUND' },
        validation.corsHeaders,
      ));
    }

    const eventId = purchaseOrder?.order_number || payload.eventId;
    const resolvedPhone = purchaseOrder?.customer_phone || payload.phone;
    const resolvedEmail = purchaseOrder?.customer_email || payload.email;
    const storedContext = parseMetaOrderContext(purchaseOrder?.meta_request_context);
    const storedClickIds = parseClickIds(purchaseOrder?.ad_click_ids);
    const event = {
      eventName: payload.eventName,
      eventId,
      eventSourceUrl: payload.eventSourceUrl,
      userData: {
        phone: resolvedPhone,
        name: purchaseOrder?.customer_name || payload.name,
        email: isSyntheticBuyerEmail(resolvedEmail, resolvedPhone)
          ? undefined
          : resolvedEmail,
        city: purchaseOrder?.city || payload.city,
        province: purchaseOrder?.province || payload.province,
        postalCode: purchaseOrder?.postal_code || payload.postalCode,
        // No edge fallback here: the caller is another server, so its
        // `cf-ipcountry` is that server's location and never the buyer's.
        country: resolveMetaCountry(payload.country, null, Boolean(purchaseOrder)),
        externalId: payload.externalId || storedContext.externalId || (purchaseOrder
          ? toE164Digits(purchaseOrder.customer_phone)
          : undefined),
        fbp: payload.fbp || storedContext.fbp || storedClickIds._fbp,
        fbc: payload.fbc || storedContext.fbc || storedClickIds._fbc,
        clientIp: storedContext.clientIp || getClientIp(request.headers),
        userAgent: storedContext.userAgent || request.headers.get('user-agent') || '',
      },
      customData: {
        contentName: payload.contentName,
        contentIds: resolveMetaPurchaseContentIds(purchaseOrder, payload.contentIds),
        value: purchaseOrder?.product_value ?? payload.value,
        currency: payload.currency,
        orderNumber: purchaseOrder?.order_number,
      },
    };

    const queued = await enqueueCapiEvent(database, event);
    if (!queued) {
      return validation.finalize(headlessOk(
        {
          deduplicated: true,
          event_id: eventId,
        },
        200,
        validation.corsHeaders
      ));
    }

    const delivered = await deliverCapiEvent(
      database,
      eventId,
      adsConfig.metaPixelId,
      adsConfig.metaCapiToken
    );

    const drain = drainCapiOutbox(database, adsConfig.metaPixelId, adsConfig.metaCapiToken)
      .catch((err) => console.error('headless-tracking-drain-error', err));
    if (locals.cfContext) locals.cfContext.waitUntil(drain);
    else void drain;

    return validation.finalize(headlessOk(
      {
        event_id: eventId,
        event_name: payload.eventName,
        delivered,
        queued: !delivered,
      },
      200,
      validation.corsHeaders
    ));
  } catch (error) {
    return validation.finalize(headlessError('Gagal memproses tracking signal event.', 500, {
      code: 'TRACKING_SIGNAL_ERROR',
      details: error instanceof Error ? error.message : String(error),
    }, validation.corsHeaders));
  }
};
