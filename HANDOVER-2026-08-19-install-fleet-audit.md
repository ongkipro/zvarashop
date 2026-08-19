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

The empty `warehouses` table remains — the origin still comes from
`MENGANTAR_ORIGIN_AREA_ID`, exactly as on taniniaga. It works, but an operator
opening `/admin/settings/warehouse` would find nothing there.
