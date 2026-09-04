# STATUS — ZvaraShop

> Verified against disk: 2026-09-04 @ `81e2031` + open-gap audit working tree

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

## 2026-09-04 open-gap audit

Two Meta defects were found by reading the code rather than the documents, and
both had been invisible because the surface that would show them kept working.

- **`country` never reached the CAPI leg from `/api/meta-event`.** It was
  validated, hashed, sent by the `/thanks` browser leg and forwarded by the
  headless route — and omitted from `user_data` on the route that carries every
  first-party PageView, ViewContent and `/thanks` Purchase. The two legs of one
  order therefore described the buyer with different key sets.
  `resolveMetaCountry` now supplies it and `meta-event-country.test.ts` asserts
  it against the stored outbox payload; removing the fix fails two of its three
  cases.
- **A browser `ViewContent` could be replayed ahead of the pixel `init` and
  discarded.** Measured against the live `fbevents.js` in an isolated frame on
  2026-09-04: `track` before `init` produced **zero** beacons to
  `facebook.com/tr`, `init` before `track` produced one. The order was decided
  by parse timing — replaying the real inline scripts in a single tick loses it
  deterministically, while the local dev page happened to win it — so the loss
  was silent and intermittent, and the CAPI twin kept arriving either way. All
  trackers now queue through `window.__PS_META_TRACK__`.

Six ledger gaps moved. **COD1** settled as a stated store price rather than a
provider mirror, so `payment-fee-policy.ts` now says so at the constants;
**DOC1** closed by re-extracting `DESIGN-SYSTEM.md` from the tree, which was
describing a retired template, a deleted component and a canvas colour with zero
occurrences under `src/`. An operator can now recover Meta events a dead access
token terminated, from `/admin/ads/meta`, after the token is proven live. And
**S1** closed (store settings now edit `theme_color`,
`locale` and `admin_name` against the resolver's own patterns), **NOT1** closed
(migration `0054` per-operator notification floor plus a 90-day scheduled
prune), **AD3** reduced to its out-of-stock clause after the Google feed began
declaring `identifier_exists: no` — the truthful statement for a schema with no
GTIN or MPN column.

Local evidence after the last edit:

- version `1.5.0`, schema `55`, migrations `0000`–`0054`;
- `npm test`: 655 total, 654 passed, 1 skipped, 0 failed;
- `npm run check`: 431 files, 0 errors, warnings, or hints;
- `npm run build`: passed;
- `npm run docs:check`: 29 Markdown files and all local links passed;
- a fresh local D1 applied all 55 migrations successfully;
- Chromium on a seeded local store rendered `/produk/<slug>` with a configured
  pixel and recorded the real `fbq` call order as
  `init -> PageView -> ViewContent`.

Not verified, and deliberately not claimed: the rendered admin store-settings
form. The local runtime has no session-signing secret, so login answers "Login
admin belum dikonfigurasi di server", and this audit did not read or create
one. The three new fields therefore have compile, type, API and wiring
evidence, but no browser evidence — which remains a release gate. Nothing in
this audit contacted a provider, read a secret, ran remote D1, or deployed.

## 2026-09-03/04 Meta CAPI incident

Read from production D1 on 2026-09-04 with explicit approval; metadata only, no
payloads, no customer data, no writes.

- **No Purchase was lost.** 34 Purchase events delivered; zero Purchase rows
  undelivered. Every affected event is top-of-funnel: PageView, ViewContent,
  AddToCart, InitiateCheckout.
- **Sharp cutover.** Last successful delivery `2026-09-03T11:22:09Z`; first
  occurrence of the new error `2026-09-03T12:14:21Z`. A 52-minute window, with
  no code change between them — the live Worker was `e7c9ee7`, deployed days
  earlier.
- **107 rows** (83 terminal, 24 still pending at the time of reading) carry
  `Unsupported post request. Object with ID '1566746954921686' does not exist,
  cannot be loaded due to missing permissions, or does not support this
  operation.` This is destination-side: the pixel is unreachable to the token
  in use. Root cause is a Meta configuration or permission change and is **not
  resolved by any deploy**.
- **33 rows** from `2026-09-01` carry the invalidated-session token error and
  have not grown since `2026-09-01T16:36`. These are the rows this document
  already recorded.
- Rows were observed with `attempts` of 9 against a `max_attempts` of 5, which
  no sequential path can produce. That is the concurrent-drain defect, now
  fixed by claiming a batch before transmitting it.

Recovery is available but deliberately gated: `/admin/ads/meta` proves the
token and pixel live with a probe event and refuses to requeue anything if Meta
rejects it. Pressing it before the pixel/permission is fixed cannot damage
anything and will simply decline.

## Deployment 2026-09-04

`install/zvarashop` at `8828c2c` deployed as Worker version
`27cf401a-8ca2-4689-b85a-01b909a8a270`, triggers `zvara.shop`, `www.zvara.shop`
and the `7 * * * *` schedule. The branch was rebased onto five commits that had
been pushed by another session (three native landing pages plus two
`schema-version.ts` commits that cancel each other out, net zero); the merged
tree passed every gate before deploy.

Live evidence after the deploy:

- `/`, `/produk`, `/sitemap.xml`, both feeds, `/robots.txt`, `/thanks` and
  `/hello` all `200`; unauthenticated `/api/admin/health` correctly `401`.
- The three new landing pages return `200`.
- 35 items in the live Google feed carry `<g:identifier_exists>no</...>`.
- Chromium on `/produk/lampu-led-multifungsi` recorded the real `fbq` call order
  as `init -> PageView -> ViewContent`, exactly one pixel initialised, and
  **both browser beacons reaching `facebook.com/tr`** with distinct `eid`s —
  the ViewContent leg that the ordering defect could silently drop. Zero
  horizontal overflow, clean console.

A first pass at that check reported a `TypeError` and a "Multiple pixels with
conflicting versions" warning. Both were artifacts of the instrumentation used
to observe call order — the `fbq` wrapper copied `queue` before the stub had
created it — and neither appears on a clean load. Recorded because the
instrumented reading looked exactly like a production defect.

The incident itself is **not** resolved by this deploy, as expected: 125
terminal and 23 pending rows remain, still failing against pixel
`1566746954921686`, newest failure `2026-09-04T04:54Z`. All 125 are inside the
deployed recovery scope — none excluded as unreadable, none yet too old.

**There is a deadline.** Retries preserve the original `event_time` and Meta
rejects an event older than seven days, so the oldest recoverable row
(`2026-09-01T12:31Z`) ages out of recovery at about **2026-09-08T12:31Z**. Fix
the pixel or the token's permission on it before then, and the requeue on
`/admin/ads/meta` will still be able to take all of them.

## Known boundaries

- Provider credentials and live account acceptance cannot be proven without
  operator-controlled secrets and external test consoles.
- AutoLaris callback rows remain evidence only; they never transition payment.
- AutoLaris checkout creates one `/submit` record classified as digital/non-physical with `courir_id: 1`; it never creates or dispatches a shipment.
- Hourly Advice checks use the stored provider transaction ID. `PENDING`, `DELIVERED`, and unknown statuses remain unchanged; explicit settlement is guarded and idempotent.
- Stock is bookkeeping and never gates a sale (ADR-023).
- Production release is not automatic and is not authorized by this document.
- The checkout fingerprint blocks exact replays, not fraud where an attacker
  materially changes buyer, address, item, shipping, or payment identity.
