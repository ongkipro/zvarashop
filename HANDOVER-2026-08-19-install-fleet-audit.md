# Handover — AdsBookCMS install fleet audit

> Verified against disk: 2026-08-19 @ `49b6fcc` on `install/zvarashop`
> Scope: the three installs and the product checkout on this machine.
> This file lives on the install branch only. It never reaches the product repository.

## 1. The fleet as it actually is

| Checkout | Role | Shape (`RELEASE.md` §7) | Live | Own repo |
| --- | --- | --- | --- | --- |
| `~/Projects/adsbookcms` | product | n/a | deploys nothing | `ongkipro/adsbookcms` |
| `~/Projects/zvarashop` | install `zvara.shop` | A — local clone | 200, 32 products | none |
| `~/Projects/taniniaga` | install `taniniaga.shop` | A — local clone | 200 | none |
| `~/Projects/permatamall` | install `permatamall.shop` | B — own repo | 200 | `ongkipro/permatamall` |
| `~/Projects/permatamall-perf` | second worktree of the above | B | — | same |

`wrangler deploy` uploads from the working directory; Cloudflare never sees a
repository. zvara's live Worker was uploaded 2026-08-18 12:12 UTC and matches
local `ceaf11a`, so before this audit the code serving a live store existed on
one disk with no remote anywhere.

## 2. What was wrong, and what was done

| # | Finding | Severity | State |
| --- | --- | --- | --- |
| 1 | ~~Fabricated~~ `aggregateRating` and three invented "verified" reviews are generated in `src/lib/catalog-data.ts` for every product and reach live JSON-LD (`ratingValue: 4.9, reviewCount: 235`, derived from the product id) | P0 | **kept, by decision (2026-08-19)** |
| 2 | zvara's real `wrangler.jsonc` (Worker name, D1 id, KV id, R2 bucket, domains) committed on `feat/admin-access-dashboard`, a branch that exists on the product remote, with push enabled | P0 | fixed |
| 3 | Two foreign catalogue dumps (`AUS-*` palm-care SKUs, permatamall bag SKUs, 99 INSERTs) committed into a tree shared with the product | P0 | fixed |
| 4 | Active-product validation weakened from `stock > 0` to `stock >= 0`, and the regression test rewritten to assert price instead of stock | P1 | fixed |
| 5 | `taniniaga` held 970 lines of uncommitted product work — incl. `StoreSettings.tsx`, absent from every branch — with no backup | P1 | backed up |
| 6 | `permatamall` has no `.gitattributes`, so a product merge would overwrite its live `wrangler.jsonc`; and no `product` remote, so it could not merge at all | P1 | remote added; `.gitattributes` pending |
| 7 | No install checkout had the `merge.keepours` driver `.gitattributes` requires | P1 | fixed on all four |
| 8 | `scratch/` (20 patch scripts), `tmp_test` (138 KB binary), `seed-home.cjs` (a `wrangler d1 execute --remote` writer) committed via `90ff9a1`, whose subject named only an SVG fix | P2 | fixed |
| 9 | Four `ts(6133)` dead declarations left by the hero removal broke the 0-hint baseline | P2 | fixed |
| 10 | zvara's look is built by editing shared product code, not by a `storefront_templates` definition — the fork-per-store cost ADR-012 exists to avoid | P2 | deferred — port to the product as a third template |

### Actions taken

- `zvarashop`: push URL set to `DISABLED` (`RELEASE.md` §7 shape A).
- `zvarashop`: install work moved to `install/zvarashop`, no upstream; local
  `feat/admin-access-dashboard` reset to the remote position. No history was
  rewritten — every commit remains reachable from the install branch.
- `zvarashop`: three commits — untrack scratch/junk, untrack foreign dumps,
  remove dead declarations. Files stay on disk via `.git/info/exclude`, which
  keeps the product tree untouched.
- `zvarashop`, `taniniaga`, `permatamall`, `permatamall-perf`: `merge.keepours`
  configured.
- `permatamall`, `permatamall-perf`: `product` remote added.
- `taniniaga`: uncommitted work copied to the session scratchpad as a patch plus
  an untracked-file tarball. Its working tree was not touched.

### Gates after the changes

`npm test` 419/419 · `npm run check` 371 files, 0 errors / 0 warnings / 0 hints ·
`npm run build` complete. No deploy, no remote D1 access, no push.

## 3. Decisions taken 2026-08-19

1. **Fabricated social proof stays.** The synthetic rating, review count, sold
   count and three invented reviews remain live, structured data included. The
   Google review-snippet policy exposure was stated and accepted. Recorded here
   so nobody later reads it as an accident.
2. **Stock is not meant to gate anything** — every product is held in the
   store's own warehouse. Publication validation and the storefront filter were
   only made to agree with each other, so a product can no longer be active in
   the admin and absent from the store at the same time. Making `stock = NULL`
   mean "not counted" was attempted and reverted: `catalog-data.test.ts:104`
   asserts that a null stock fails closed on the storefront, which is a product
   contract, not an install one. Reopening it belongs in `adsbookcms` with an ADR.
   Until then, keeping the numbers high is the install-side answer.
3. **Both installs get their own repository** — `ongkipro/zvarashop` and
   `ongkipro/taniniaga`, private, shape B. Done.
4. **The zvara look belongs in the product** as a third storefront template
   selected per install, not as edits to `CompactMarketHome`. Not started.

## 3a. Still needing approval

- Reading `zvarashop-d1` with `--remote` to see the real stock distribution. The
  imported dump has 64 of 66 variants at zero, yet 32 of 33 products publish
  live, so the live values differ from the dump and are currently unknown.
- Deploying `52d985a` to `zvara.shop`.

## 4. Not done

- `~/Projects/adsbookcms` was not touched; it was dirty with concurrent work.
- No `.gitattributes` was added to `permatamall` (it is a live store's repository).
- Secrets were not read. zvara has no `.dev.vars`; its Worker secrets exist only in Cloudflare, unrecorded.
- Remote D1 state was not read. The warehouse-row concern in `STATUS.md` §4 stands.


---

## 5. zvara.shop cannot quote shipping (2026-08-19)

**Symptom.** The full form never produces a shipping cost.
`GET /api/shipping-options` returns 502 `SHIPPING_PROVIDER_ERROR`.

**Not a code fault.** `git diff product/feat/admin-access-dashboard..install/zvarashop`
touches no shipping file, and the same endpoint answers correctly on the other
two installs with the same destination — permatamall quotes JNE 10.000,
taniniaga 11.000, zvara fails.

**Why the cause was invisible.** `MengantarClient` throws the provider's own
message with the API key redacted, and the catch in `shipping-rates.ts` replaced
it with a generic string and logged nothing. A revenue path failed with no trace
in Workers Logs. Fixed in `19e34ae`, deployed, and the message appeared at once.

**What the provider actually says.**

| Credential in use | Message |
| --- | --- |
| `stores.mengantar_api_key` (`API-…`, 20 chars) | `Mengantar API menolak permintaan.` — HTTP 200, `success: false`, no message |
| Worker secret `MENGANTAR_API_KEY` | `Not allowed` |

Neither credential is accepted by Mengantar for this account. The stored key was
cleared (one-row remote update, approved) so the install now resolves the same
way taniniaga does; the remaining rejection is the Worker secret's own value.

**Configuration read (masked, `--remote`, approved).**

| | zvara | taniniaga |
| --- | --- | --- |
| `warehouses` | empty | empty |
| `stores.mengantar_api_key` | was set, now `NULL` | `NULL` |
| `stores.mengantar_base_url` | was set, now `NULL` | `NULL` |
| Worker secrets present | `MENGANTAR_API_KEY`, `MENGANTAR_ORIGIN_AREA_ID`, `MENGANTAR_PICKUP_ADDRESS_ID` | same three |

Both installs carry an empty `warehouses` table, so the origin comes from
`MENGANTAR_ORIGIN_AREA_ID` in both. taniniaga works that way, which is why the
origin is not the first suspect — but a key and an origin belonging to different
Mengantar accounts would also produce `Not allowed`, so it is not excluded.

**Open.** The operator must supply a Mengantar key that this account accepts,
either through `/admin/profile` (the database value wins) or by replacing the
Worker secret. Nothing further can be determined without it; no credential value
was read or printed during this work.

**Product defect fixed alongside it** (`49b6fcc`): a stored provider credential
could be overwritten from `/admin/profile` but never removed, so a wrong key
permanently shadowed the deployed Worker secret with no way out of the admin.
An explicit clear now exists. `/admin/profile` already reported which source was
active, so no change was needed there.

**Deployed to zvara.shop on 2026-08-19**: `19e34ae` (shipping-quote logging) as
version `0490c7b2`, then `49b6fcc` (credential clear) as version `d94dc010`.
Post-deploy smoke: `/` 200, `/produk` 200 with 32 products, `/admin/profile` 302
to login, `/api/locations` 200. `/api/shipping-options` still returns
`SHIPPING_PROVIDER_ERROR`, which is expected until a Mengantar key this account
accepts is supplied — that is the one thing still blocking checkout.

### Resolved 2026-08-19

The operator supplied a Mengantar credential the account accepts. Verified
against the live install, not only in tests:

- `GET /api/shipping-options` returns rates for two different destinations, and
  they differ by distance — Cikarang Barat quotes JNE 10.000 / SiCepat 9.000 /
  SAP 7.500, Denpasar quotes JNE 30.000 / SiCepat 27.000.
- Driven in a real browser at 390 CSS px on
  `/full-form?product_id=holder-hp&variant_id=20075`: typing a district fires
  `/api/locations` search then resolve, then
  `/api/shipping-options?...&variant_unique_id=20075` returns 200, and the
  summary renders **Biaya Pengiriman Rp9.000 (JT)**, Biaya COD Rp2.598, Total
  Rp80.598. Zero console errors, no horizontal overflow.

**Update, same day.** The warehouse row now exists — `origin_area_id`
`5fc62f66…`, `pickup_address_id` `6a857fd1…`, both well-formed provider
ObjectIds — so the origin comes from D1 and no longer from
`MENGANTAR_ORIGIN_AREA_ID`. Quotes still return for Cikarang Barat and Denpasar,
and the browser flow still renders shipping, COD fee and total.

Courier coverage narrowed from five to two in the same window (JNE and J&T).
That is **not** an effect of the new origin: `shipping-quote.ts` filters every
provider rate through `courier_rules`, and that table now has 8 of its 10 rows
disabled. It is an operator policy setting in `/admin/expeditions`, not a
configuration fault. Worth knowing that SAP, previously the cheapest at 7.500 to
Cikarang Barat, is among the disabled ones; the cheapest COD option is now J&T
at 9.000.

---

## 6. Meta Ads: configuration, CAPI, storefront, thanks page (2026-08-19)

**Verdict.** The implementation is complete and unusually careful. zvara's
configuration is empty, so none of it runs.

**Configuration read from D1 (masked, `--remote`).** `meta_pixel_id`,
`meta_capi_token`, `google_tag_manager_id`, `google_ads_conversion_id` and
`google_ads_conversion_label` are all `NULL`, `wrangler secret list` shows no
`META_*` or `FB_*` fallback, and `capi_event_outbox` holds zero rows.

**Live proof.** On `/`, `/produk/holder-hp`, `/full-form` and `/thanks`:
`window.fbq` is `undefined`, no `fbevents.js` is loaded, and no request reaches
`facebook.com`. `MetaPixelBase` gates on `/^\d{5,25}$/`, so an absent Pixel ID
renders nothing at all — correct, not a fault.

**What already runs without the pixel.** Click-ID capture works today: a request
carrying `?fbclid=…&gclid=…` comes back with `adsbook_click_ids` and a
server-set `_fbc` cookie in `fb.1.<ts>.<fbclid>` form, `Max-Age` 90 days,
`SameSite=None; Secure`. The browser also posts `PageView` and `ViewContent` to
`/api/meta-event` on every page; the endpoint answers `202 {skipped: true,
reason: "Meta CAPI is not configured for this store."}`. Filling the credentials
starts the whole funnel with no code change and no deploy.

**Event coverage.** `PageView`, `ViewContent`, `AddToCart`, `InitiateCheckout`,
`Purchase` — the browser set and the server whitelist in
`meta-event-contract.ts` agree. `MetaPixelBase` and `MetaPageViewTracker` mount
in `BaseLayout`, `MetaViewContentTracker` on the product page,
`MetaLandingTracker` on all four form routes and the landing catch-all, and
`MetaThanksTracker` on `/thanks`.

**Deduplication.** Both legs share one `event_id`. For `Purchase` the id is the
**order number**, resolved server-side, so the browser cannot mint an id the
CAPI leg would not reproduce.

**Purchase qualification on `/thanks`** — the strongest part of the design:
`order_pk` plus `status_token` are required, `POST /api/order-status` must
confirm the order, a non-COD order must be `is_paid`, the reported value is
replaced by the server's `total_amount` (so shipping and the COD fee are
included and a tampered `sessionStorage` cannot dictate revenue), and a
per-order guard blocks a double fire. An order that cannot be resolved gets no
Purchase at all rather than an undeduplicatable one.

**Identity.** `meta-capi.ts` hashes name, city and E.164 phone with SHA-256
through `crypto.subtle` before transmission; `fbp` and `fbc` are forwarded raw,
which is what Meta requires. Delivery is durable: every event is written to
`capi_event_outbox` before sending, retried on failure, and drained by the
hourly cron (`schedule: 7 * * * *`).

### Gaps worth a decision

1. **Nothing is configured.** Pixel ID and CAPI token at `/admin/ads/meta`; the
   database value wins over any secret, so no deploy is needed. Google Ads, GTM
   and TikTok are equally empty.
2. **No `Lead` event.** The CMS captures abandoned leads into its own workspace
   but never reports `Lead` to Meta, so lead-optimised campaigns have no signal.
   `META_EVENT_NAMES` would have to grow for that.
3. **Purchase depends on same-origin `sessionStorage`.** A buyer who loses
   `order_pk`/`status_token` — a refresh into a new context, a share of the URL —
   produces a real order with no Purchase event. That is deliberate fail-closed
   behaviour, but it undercounts, and the size of the undercount is unknown.

### `/admin/ads/meta` could never save (2026-08-19)

The operator reported that saving the Meta configuration failed. It was not a
credential or a paste error — the page called an endpoint contract that does not
exist:

| Page sent | Route offers |
| --- | --- |
| `POST /api/admin/ads` | only `GET` and `PUT` |
| body without `action` | handler branches on `action === 'save-meta'` |
| `POST /api/admin/ads/test-meta` | no such route; the real one is `PUT /api/admin/ads` with `action: 'test-capi'` |

The second row is the dangerous one: fixing only the method would have made the
request fall through both branches and return `success: true` with nothing
written. `/admin/ads/google` already used `PUT` plus an explicit action, which is
what proves the intended contract. Fixed to match.

This also explains the fleet asymmetry recorded in §6 — permatamall has a Pixel
ID because it was configured before this page existed; zvara and taniniaga never
could be.

### Carried back to the product (2026-08-19)

Three of the four fixes are product defects and were ported to `adsbookcms` as
`fix/install-audit-findings` → **PR #2**, based on `feat/admin-access-dashboard`,
built in a throwaway worktree so the active checkout was never touched. Gates on
that branch: `npm run check` 0/0/0, `npm test` **422/422** (product baseline was
419; the three extra come from `provider-config.test.ts`), build complete.

The catalog-publication commit was **not** ported. It only undid a regression
this install had introduced locally — the product still has `stock > 0` in both
places and still carries the original regression test, verified before skipping.

`STATUS.md` and `BUILD-LOG.md` were deliberately left alone in the product; they
were being edited concurrently. The `STATUS.md` verification baseline needs to
move 419 → 422 when the PR lands.

---

## 7. Meta verified, isolation audited, fixes landed (2026-08-19)

### Meta Ads now works end to end

`meta_pixel_id` is `1549622009399777` and a 209-character CAPI token is stored.
Verified live rather than assumed:

- The pixel loads — `fbevents.js` present, `window.fbq` is a function, and the
  configuration request is `/signals/config/1549622009399777?…&domain=zvara.shop`,
  so the right pixel is bound to the right domain.
- The server leg delivers. `capi_event_outbox` holds `PageView` and
  `ViewContent` rows, every one `status = sent` with `attempts = 0` — accepted
  by Meta on the first try, no retries.

`Purchase` is the one event still unproven, because proving it means placing a
real order on a live store. Its gating is read in §6 and the browser and server
legs share the order number as `event_id`, so the remaining risk is low but not
zero.

### zvara stands alone

| | zvara | taniniaga | permatamall |
| --- | --- | --- | --- |
| Worker | `zvarashop` | `taniniaga` | `cmsads-permatamall` |
| D1 | `79e02ca0…` | `925955e5…` | `054f2261…` |
| KV `SESSION` | `6a63603c…` | `f760e8f3…` | `073d2b37…` |
| R2 | `zvarashop-assets` | `taniniaga-assets` | `cmsads-permatamall-assets` |
| Domain | `zvara.shop` | `taniniaga.shop` | `permatamall.shop` |

Nothing is shared — not a database, not a session namespace, not a bucket. The
repository is `ongkipro/zvarashop`, `product` is fetch-only with its push URL
`DISABLED`, and the only workflow here runs check/test/build with no deploy step.

Remaining mentions of other stores in this tree are inherited product history,
not live ties: migrations `0017`/`0034` describe removing a foreign sample row,
`developer-api-keys.ts` keeps the `cmsads_live_` prefix validating (AGENTS.md §7),
and some product tests use `permatamall.shop` as a fixture URL. The two foreign
catalogue dumps are untracked — present on this disk only, never in the
repository.

### Fixes landed in the product

PR #2 merged into `feat/admin-access-dashboard` as `0b34972`, carrying the three
product defects. Two of its files — `src/pages/admin/ads/meta.astro` and
`src/pages/api/shipping-rates.ts` — are also modified in the uncommitted work
sitting in `~/Projects/adsbookcms`, so a plain `git pull` there will refuse or
conflict. Commit or stash those two first.

### Baseline stamped, zvara redeployed (2026-08-19)

`STATUS.md` in the product now records what was actually executed on a clean
worktree of `0b34972`: `npm test` **422 / 422**, `npm run check` **354 files**
0/0/0, build complete. The header also drops its `+ the A17 working tree`
qualifier, because those numbers describe a committed tree. Landed as PR #3
(`6bd68ad`).

zvara redeployed as version `a7661610`. No code changed since `bea73eb2` — the
diff over `src/`, `public/` and config between the deployed commit and HEAD is
empty, and the commits in between are this handover only. Post-deploy: `/` 200,
`/produk` 200, `/admin/login` 302, `/full-form` 200, a live JNE/J&T quote, and
`capi_event_outbox` at **27 rows, all `sent`**, no failures.

---

## 8. Google Ads setup, generated files, `/admin/content` (2026-08-19)

### Google Ads / conversion — correct, and entirely unconfigured

`google_ads_conversion_id`, `google_ads_conversion_label` and
`google_tag_manager_id` are all `NULL`, so `GoogleAdsBase` renders nothing —
it gates on **both** id and label being present, and the API refuses to save one
without the other. Nothing is broken; nothing has started.

What the code does once configured, verified by reading it:

- **Consent Mode v2, region-scoped.** Defaults are `denied` for the EEA/UK region
  list and `granted` elsewhere, so an Indonesian store does not destroy its own
  signal to satisfy a rule that does not apply to it.
- **Conversion fires only inside the server-verified Purchase gate** it shares
  with Meta — the order must resolve through `/api/order-status`, a non-COD order
  must be `is_paid`, and the value is the server's `total_amount`.
- **`transaction_id` is the order number**, and the key is omitted rather than
  sent empty when there is none, so orders dedupe instead of colliding.
- **Enhanced conversions** send `sha256_phone_number` (E.164 **with** the leading
  `+`), `sha256_first_name` and `sha256_last_name`, hashed in the browser. The
  code notes explicitly that Google matches on `+`-prefixed E.164 while Meta
  matches on digits only — same number, two different hashes, correctly not
  shared.

Gaps, none blocking:

1. **Browser-only.** Meta has a durable CAPI outbox; Google has no server leg at
   all. A blocked or abandoned `/thanks` costs a Google conversion outright,
   while the Meta one still lands. Offline Conversion Import would close it.
2. **Enhanced-conversion match rate left on the table.** Checkout collects
   province, city, district and postal code, none of which are sent. Email is not
   collected at all.
3. **COD counts as a conversion immediately.** Correct for a COD business
   optimising for orders, but cancelled COD is never retracted, so reported
   conversions run above delivered revenue by the cancellation rate.

### Generated files — all automatic, verified live

| File | Route | Rendering | Live result |
| --- | --- | --- | --- |
| `sitemap.xml` | `src/pages/sitemap.xml.ts` | SSR, D1 | 40 `<url>`, **32** product URLs, every one with `lastmod` |
| `feed/google-catalog.xml` | `.ts` | SSR, D1 | **32** `<item>` |
| `feed/meta-catalog.xml` | `.ts` | SSR, D1 | **32** `<item>` |
| `robots.txt` | `src/pages/robots.txt.ts` | SSR | serves, and names the sitemap |

All four are `prerender = false` and read the catalogue through
`getStorefrontProducts`, so a new or edited product appears with no rebuild and
no deploy. 32 in all three matches the 32 products the storefront lists. The
feeds and sitemap carry `Cache-Control: max-age=3600`, so the edge can serve a
product up to an hour stale — automatic, not instant.

### robots.txt is being written by two authorities

The response contains a `# BEGIN Cloudflare Managed content` block that
`robots.txt.ts` does not produce — zero occurrences in the source. Cloudflare is
prepending it at the zone. The result has **two `User-agent: *` groups** and
duplicate, contradictory groups for `GPTBot` and `ClaudeBot`: Cloudflare says
`Disallow: /`, the application says `Allow: /` plus its real disallow list.

The application's own header comment explains why this matters — per RFC 9309 a
crawler obeys only its most specific matching group. A parser that takes the
first matching `User-agent: *` group sees Cloudflare's, which carries **no
disallows at all**, and never reaches the group that protects `/admin/`, `/api/`,
`/embed/`, `/hello` and `/install`.

Decide one authority. Turning off Cloudflare's managed robots.txt for the zone
leaves the application's file — the one that actually protects the admin —
authoritative.

### `/admin/content` is load-bearing

It is the only editor for storefront home content: `ContentWorkbench` →
`/api/admin/content` → `storefront_content`. zvara has one published `home` row
of 1027 bytes, and its hero title **"Koleksi Terbaik Zvara" renders on the live
home today**.

More important, `index.astro:66` shows a `setup-required` state when no home
content is published, and its text directs the operator to exactly this screen.
Deleting the route would leave a fresh install pointing at a page that does not
exist, with no way to leave the setup state — the same shape of failure as the
bootstrap-password change recorded in `STATUS.md` §5.
