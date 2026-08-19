# Handover — AdsBookCMS install fleet audit

> Verified against disk: 2026-08-19 @ `518414c` on `install/zvarashop`
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
| 1 | Fabricated `aggregateRating` and three invented "verified" reviews are generated in `src/lib/catalog-data.ts` for every product and reach live JSON-LD (`ratingValue: 4.9, reviewCount: 235`, derived from the product id) | P0 | **open — needs a decision** |
| 2 | zvara's real `wrangler.jsonc` (Worker name, D1 id, KV id, R2 bucket, domains) committed on `feat/admin-access-dashboard`, a branch that exists on the product remote, with push enabled | P0 | fixed |
| 3 | Two foreign catalogue dumps (`AUS-*` palm-care SKUs, permatamall bag SKUs, 99 INSERTs) committed into a tree shared with the product | P0 | fixed |
| 4 | Active-product validation weakened from `stock > 0` to `stock >= 0`, and the regression test rewritten to assert price instead of stock | P1 | **open — needs a decision** |
| 5 | `taniniaga` held 970 lines of uncommitted product work — incl. `StoreSettings.tsx`, absent from every branch — with no backup | P1 | backed up |
| 6 | `permatamall` has no `.gitattributes`, so a product merge would overwrite its live `wrangler.jsonc`; and no `product` remote, so it could not merge at all | P1 | remote added; `.gitattributes` pending |
| 7 | No install checkout had the `merge.keepours` driver `.gitattributes` requires | P1 | fixed on all four |
| 8 | `scratch/` (20 patch scripts), `tmp_test` (138 KB binary), `seed-home.cjs` (a `wrangler d1 execute --remote` writer) committed via `90ff9a1`, whose subject named only an SVG fix | P2 | fixed |
| 9 | Four `ts(6133)` dead declarations left by the hero removal broke the 0-hint baseline | P2 | fixed |
| 10 | zvara's look is built by editing shared product code, not by a `storefront_templates` definition — the fork-per-store cost ADR-012 exists to avoid | P2 | **open — needs a decision** |

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

## 3. Open decisions

1. **Fabricated social proof.** It is live and indexable. Google requires review
   snippets to come from genuine reviews; the CMS already stores real ratings and
   reviews per product as content. Remove entirely, strip from JSON-LD only, or keep.
2. **Zero-stock publishing.** Restoring `stock > 0` hides every sold-out variant —
   and the imported catalogue has many. Leaving `>= 0` lets a buyer fill the form
   and be rejected at submit by `order-persistence.ts:331`. No overselling either way.
3. **Repository shape for zvara and taniniaga.** Shape A means no backup at all.
4. **Where the zvara look belongs** — a `storefront_templates` definition, a new
   template in the product, or install-only edits that must be re-applied forever.

## 4. Not done

- `~/Projects/adsbookcms` was not touched; it was dirty with concurrent work.
- No `.gitattributes` was added to `permatamall` (it is a live store's repository).
- Secrets were not read. zvara has no `.dev.vars`; its Worker secrets exist only in Cloudflare, unrecorded.
- Remote D1 state was not read. The warehouse-row concern in `STATUS.md` §4 stands.
