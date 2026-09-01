# STATUS — ZvaraShop

> Verified against disk: 2026-09-02 @ `03a16ea` + Meta token recovery production evidence

## Repository authority

`ongkipro/zvarashop` is the sole source repository for ZvaraShop. The checkout,
admin, migrations, Cloudflare bindings, merchant assets, documentation, and
release evidence are owned here. The former `product` remote and
`scripts/sync-from-product.sh` workflow are retired; external changes must be
ported as ordinary reviewed commits without replacing the tree.

## Runtime shape

- One Cloudflare Worker: `zvarashop`.
- One store/domain: `zvara.shop` and `www.zvara.shop`.
- One D1 database, one KV namespace, one R2 bucket, and one Workers AI binding.
- D1 migrations are bundled and applied as a validated forward suffix on the
  first database-backed request after deployment.
- CI verifies source only. Production deploy remains an explicit action.

Repository history records successful production deployments to `zvara.shop`,
including the 2026-08-19 fleet handover. This audit did not contact production,
inspect Cloudflare state, read secrets, run remote D1, or deploy; therefore the
current live revision is deliberately not claimed here.

## Verified baseline and current audit

Before the 2026-09-01 working-tree changes:

- 605 tests: 604 passed, 1 skipped, 0 failed.
- `npm run check`: 0 errors, warnings, or hints.
- `npm run build`: passed.
- 51 ordered migrations, `0000` through `0050`.

The current audit hardens ad signals and repository ownership:

- Meta public event ingestion is D1-rate-limited per client address.
- Both first-party and headless Meta Purchase paths resolve canonical order
  identity, catalog `content_ids`, merchandise value, and customer data from D1.
- Paid click identifiers survive later UTM-only visits; a genuine new ad click
  remains last-touch attribution without erasing the other ad network.
- Meta `_fbp` is established before immediate CAPI page events, and checkout
  retains validated `_fbp`, `_fbc`, external ID, IP, and user agent for a
  Purchase emitted after a later payment confirmation.
- Google Ads offline reconciliation filters unattributed orders before its
  bounded queue window, preventing organic orders from blocking paid uploads.
- Google Ads offline outbox depth/failure is part of operational health and
  alert evaluation.
- Admin Ads configuration distinguishes database, environment, and absent
  sources without exposing tokens or presenting “configured” as “connected”.
- Migration `0051` adds product-owned brand and catalog description. Google and
  Meta feeds skip invalid legacy IDs, prefer the product brand, and do not
  claim merchant SKU is a manufacturer MPN.
- Meta and Google terminal outbox rows are retained for 30 days; CAPI retries
  preserve the original event time and prioritize Purchase delivery.
- `ZvaraShop` is the public/repository identity. Stable AdsBook compatibility
  identifiers remain intentionally unchanged.
- Exact checkout replays within two hours now resolve to one D1-owned canonical
  order even when the browser supplies different submit tokens. Notification,
  receiver scoring, payment creation, Pixel Purchase, and CAPI Purchase all
  reuse that order; expired or terminal claims permit a genuine later reorder.
- The `/thanks` WhatsApp action uses the official HTTPS universal link in the
  current browsing context. A capable mobile OS may hand it to the installed
  app; otherwise WhatsApp's web/interstitial fallback replaces the same tab.
  Commit `e7c9ee7` is live as Worker version
  `813c2ac3-a761-45a9-8d00-211aa4733f00`; an uncached production response
  contains the action with `rel="nofollow"` and no browsing-context target.

Final local evidence after the last source edit:

- version candidate `1.5.0`, schema `54`, migrations `0000`–`0053`;
- `npm test`: 628 total, 627 passed, 1 skipped, 0 failed;
- `npm run check`: 412 files, 0 errors, warnings, or hints;
- `npm run build`: passed with only expected missing-local-secret warnings;
- `npm run docs:check`: 29 Markdown files and all local links passed;
- a fresh local D1 applied all 53 migrations successfully;
- Chromium at 390 × 844 rendered the first-run ZvaraShop installation page.
- Chromium at 390 × 844 rendered a COD `/thanks` state and resolved the visible
  WhatsApp confirmation button to the stored support number. Its message came
  from the CMS `redirect` template and carried the order number, buyer name,
  product, and total; page-level horizontal overflow was zero.
- The same `/thanks` run emitted one Pixel Purchase with `eventID` equal to the
  canonical order number, catalog Product ID in `content_ids`, and the order
  value/currency; GTM used the same `transaction_id`. Reload emitted neither a
  second Pixel nor a second GTM Purchase.
- deployment preflight accepted clean `install/zvarashop` at `373e90b` after
  the branch was pushed. Wrangler deployed Worker version
  `dc7a16d6-60ee-4676-adb1-024ecb6861b7`; live home, sitemap, Google feed, and
  Meta feed returned `200`, while unauthenticated health correctly returned
  `401`.

Production Meta acceptance was re-verified after the operator saved the Pixel
ID and access token again through the CMS:

- an organic PageView was accepted on its first attempt at
  `2026-09-01T17:25:09Z`;
- an organic product ViewContent was accepted on its first attempt at
  `2026-09-01T17:25:33Z` with one canonical catalog Product ID and value;
- both events carried external ID, `_fbp`, client IP, and user agent; `_fbc`
  was correctly absent because the smoke visit had no valid Meta click;
- no secret values or customer data were read during verification; remote D1
  inspection was limited to event status and parameter-presence metadata;
- 33 historical invalid-token terminal rows remain retained: 17 PageView and
  16 ViewContent, with no Purchase among them. They were not requeued because
  resending them is a separate production-data mutation requiring explicit
  approval.

Authenticated Meta, Google, and product-editor browser flows were not opened:
the fresh local runtime has no operator session, and this audit did not read or
create a password/session. Their source, TypeScript, test, and build checks pass,
but rendered authenticated behavior remains a release gate.

## Known boundaries

- Provider credentials and live account acceptance cannot be proven without
  operator-controlled secrets and external test consoles.
- AutoLaris callback rows remain evidence only; they never transition payment.
- Stock is bookkeeping and never gates a sale (ADR-023).
- `theme_color`, `locale`, and `admin_name` remain stored but have no admin
  editor.
- Production release is not automatic and is not authorized by this document.
- The checkout fingerprint blocks exact replays, not fraud where an attacker
  materially changes buyer, address, item, shipping, or payment identity.
