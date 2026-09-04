# AdsBookCMS — Remaining Work and Blockers

> Verified against disk: 2026-09-04 @ `81e2031` + open-gap audit working tree

This is the single ledger of work that is **not** done. Implemented behaviour belongs in `STATUS.md`, history in `BUILD-LOG.md`, accepted product behaviour in `PRD.md`, real architecture in `ARCHITECTURE.md`, and constraining decisions in `DECISIONS.md`.

Two rules govern every entry, per ADR-010:

1. **Disk wins.** Code, migrations, runtime configuration, and executed evidence outrank this file. When they disagree, fix this file.
2. **A missing contract is not a licence to invent one.** An absent provider specification never justifies inferring an endpoint, payload, authentication method, retry policy, or status enum.

All ten structural gaps in `ARCHITECTURE.md` §10 are closed. This file now owns only audited defects, incomplete product surfaces, documentation debt, and external blockers.

---

## 1. Audited Engineering Gaps

| ID | Severity | Gap | Completion boundary |
| --- | --- | --- | --- |
| AD3 | Low | **Reduced 2026-09-04.** The SKU-as-MPN half of this row was already stale: `catalog-feed.ts` had stopped emitting `g:mpn` and now also declares `<g:identifier_exists>no</g:identifier_exists>`, which is the truthful statement for a schema with no GTIN or MPN column — a branded item carrying neither previously read to Google as *missing* data. `catalog-feed.test.ts` asserts the pairing and that the merchant-editable variant `sku` reaches neither feed. What remains is the out-of-stock clause, and it is blocked by the data rather than by effort: price lives only on `product_variants`, so a product with no sellable variant has no truthful price to publish and retaining it as a stable `out_of_stock` item would require inventing one. `getPublicProductValidationError` already refuses to publish an active product without a valid priced variant, so the case is prevented upstream. | Either give products a price of their own, or accept that a variant-less product legitimately leaves the feed and close this row. |
| SCR1 | Low | The 2026-08-22 full-system screening proved the QRIS create path against AutoLaris but **not a settled payment**: capturing a paid `POST /api/h2h/advice` response means paying a real virtual account, so the confirmation path (`/thanks` replacement, paid-state gating, reconciliation marking an order paid) remains proven only by fixtures and the earlier manual-reconciliation browser smoke. It also did not exercise Mengantar dispatch (`POST /order`), which creates a real shipment and spends wallet balance, nor the Meta/Google outbound legs, which were verified by hand on 2026-08-19. | Prove the settled path once, deliberately, on a store that is ready to pay a small real amount, and record the observed `advice` response so `inquirePayment` can classify it. Dispatch stays a manual, operator-initiated action by design (A11) and should be screened against a provider sandbox if one is ever published. |

**DOC1** was closed on 2026-09-04 by re-extracting `DESIGN-SYSTEM.md` from the
tree rather than restamping it. The drift was wider than this row recorded: §1.1
documented `#F8F7F4` as the storefront canvas, a value with **zero** occurrences
under `src/`, and a champagne-gold accent that survives only inside two CSS
header comments; §1.2 and §8.12 described the `wide-catalog` template that
migration `0044` retired on 2026-08-23 under ADR-018; §7.4 described a
scroll-snap carousel with a thumbnail rail, none of whose classes exist in the
65-line component that replaced it; §7.3 listed a deleted `ProofsSection.astro`
that §2.1 also cited a line number inside; and §8.2 attributed an emerald
palette to `/payment` and `/thanks` that now appears only on admin screens. One
new inconsistency was recorded rather than resolved (§8.3a): `design-tokens.md`
and `form-hybrid.css` declare different accents and different token counts, and
which one this store should ship is a design decision.

**COD1** was settled on 2026-09-04 as what it always was: a pricing decision.
The local 3% + 11% VAT figure is ZvaraShop's own COD service price, not an
attempt to mirror Mengantar's quoted `codFee`, and the consistent one-rupiah
spread is a consequence of rounding each component up rather than a bug.
`payment-fee-policy.ts` now says so at the constants, including the consequence
that a provider rate change does not move it.

Closed 2026-09-04 by the open-gap audit: **S1** — `theme_color`, `locale` and
`admin_name` are edited at `/admin/settings/store`, validated against the same
patterns `resolveTenantConfig` resolves with (`THEME_COLOR_PATTERN`,
`LOCALE_PATTERN`, exported for exactly that reason) so a malformed value is
refused at the form rather than silently falling back; **NOT1** — migration
`0054` stamps a per-operator notification floor at creation, every read and
every clear filters above it through one shared predicate, and
`purgeExpiredNotifications` prunes at 90 days beside the other scheduled
retention jobs. Existing operators are backfilled to floor `0` on purpose: they
may hold genuinely unread notifications, and a retroactive floor would mark
those read.

Closed by the A10 work and 2026-08-18 production hardening recorded in `BUILD-LOG.md`: canonical single/bulk order transitions; exactly-once stock restoration on cancellation/deletion; non-destructive dispatched-order deletion; atomic order numbers; abandoned-order abuse controls and retention; bank-transfer verification; submit-boundary payment policy; canonical Meta Purchase identity and paid-state gates; runtime schema upgrades; fresh-install home fail-closed; runtime storefront definitions; Headless scopes, quotas, final-response audits, and public order status; per-install schema/CAPI alerting; one-time install capability; public provider rate limits with server-owned origin; and migration-owned settings schema.

---

## 2. Headless API Deliverables

Nine `/api/v1/*` routes ship with hashed developer keys, independent origin policy, minimum per-operation scopes, D1-backed per-key quotas, payload-free write audits, token-scoped public order status, and an authenticated OpenAPI 3.1 document at `/api/v1/openapi.json`. `STOREFRONT_INTEGRATION.md` §4 is the human-readable contract.

| ID | Item | Why it remains |
| --- | --- | --- |
| H9 | Cross-storefront consent handoff | No accepted merchant/legal contract defines how consent state crosses an external storefront handoff. Checkout must remain usable when tracking is declined or unavailable. |

---

## 3. External Provider Blockers

These cannot be closed from this repository alone. Each needs canonical provider documentation or an explicitly approved live capture.

| Subsystem | Missing contract | Verified boundary |
| --- | --- | --- |
| Mengantar tracking live proof | Accepted, missing, malformed, timeout, and representative shipped/delivered/RTS responses from the active account | Operator-triggered authenticated polling, sequential isolation, raw evidence persistence, and monotonic status mapping are implemented and locally tested. No callback contract is assumed; no live provider read was performed in this change. |
| Mengantar wallet | Canonical balance endpoint and response schema | `/admin/balance` is an AutoLaris D1 reconciliation ledger, not a provider wallet. |
| AutoLaris Advice settlement vocabulary | Complete provider-owned mapping for paid, expired, failed, refunded, and shipping-only statuses | The scheduled transport and guarded transition are implemented. `02/PENDING`, observed `DELIVERED`, and every unknown value are no-ops; manual reconciliation remains the fallback. The explicit paid allowlist must be revised if AutoLaris publishes a different canonical mapping. |
| AutoLaris production IP allowlist | Which egress addresses an install presents to AutoLaris | The provider's documentation requires production API access to be allowlisted to at most five IP addresses. Cloudflare Workers do not offer a fixed egress address, so no install can be declared AutoLaris-production-ready on this evidence. The development key is unrestricted, which is why every capture above was taken with it. This is an infrastructure decision, not a code change. |
| Mengantar unpaid recovery | Real insufficient-wallet response plus verified `/order/pay-unpaid` response shape, idempotency, and failure semantics | Automatic `/order/create` dispatch is a separate contract. A provider-created unpaid draft may retain its accepted provider order ID with no cnote and be visible under **Perlu Dibuatkan Resi**, but `MengantarClient.payUnpaidOrder` has no verified internal operator action. No local flow may fabricate or persist a waybill before provider acceptance. |
| Mengantar pickup proof | Current `/address` and `/time` schemas plus live accepted/rejected/timeout/duplicate evidence | Existing handlers already call provider-before-persist and leave D1 unchanged on provider failure. |

### Closing a blocked contract

1. Obtain the canonical specification or an explicitly approved capture: endpoint, authentication, schemas, status enum, retry/idempotency semantics, and replay window.
2. Implement inside the existing provider client or admin reconciliation boundary; do not open a second HTTP path.
3. Persist provider identifiers and confirmed state only after provider acceptance.
4. Keep local failure actionable; never present an unsynchronized D1 row as provider-confirmed.
5. Cover accepted, rejected, timeout, and retry paths with a runnable check.

---

## 4. Inherited Identity and Account-Coupled Copy

One known row remains: `Zanoby Purchase` in `src/pages/admin/ads/google.astro` names a conversion action configured in a Google Ads account. Editing repository copy does not rename that remote conversion action; coordinate the change with the account owner.

The legacy `zanoby_click_ids` cookie remains a read-only 90-day attribution fallback by deliberate compatibility decision. New writes use `adsbook_click_ids`; remove the fallback only after the upgrade window has elapsed.

---

## 5. Operator-Gated Actions

These are not engineering gaps. They require an explicit human decision and, where relevant, a rollback plan.

| Action | Gate |
| --- | --- |
| Live Mengantar side effects — order creation, pickup address, pickup schedule, unpaid recovery | Exact side-effect approval |
| Live AutoLaris side effects — payment creation or payment-state mutation | Exact side-effect approval |
| Meta test events | Operator-provided test code plus explicit outbound-call approval |
| Remote D1 preflight (`npm run db:migrate:remote`) | Separate production-data approval; runtime auto-upgrade does not authorize it |
| Install-repository deployment | Explicit production approval; this product repository itself has no deploy target or credentials |
| Provisioning another Cloudflare account/install | Explicit infrastructure approval |
| Scrubbing local or remote warehouse/provider identifiers | Explicit destructive-data approval |

---

## 6. Execution Order

1. Keep the Advice settlement allowlist narrow. Never add `DELIVERED` or another
   shipping status; route unknown responses to owner/admin manual confirmation.
2. Resolve Mengantar provider blockers only from canonical documentation or
   approved sandbox/live evidence.
3. **AD3** define and implement stable, truthful out-of-stock feed behavior and
   standard-identifier policy.
4. **S1** complete the runtime store identity editor.
5. **DOC1** rebuild the design-system record from the current tree.
6. Implement **H9** only after the consent contract is accepted.

---

## 7. Completion Rules

An entry is complete only when its contract, implementation, executable proof, failure behaviour, and owning canonical document are updated together.

- A green build is not evidence a UI works; open it.
- A local build is not live-provider evidence.
- Runtime migration success on local D1 is not remote-D1 approval.
- A Custom Domain is not data isolation by itself.
- A deleted Worker does not authorize deleting its D1, KV, R2, DNS, or secrets.
- A documented prompt is not an executable adapter.

Local gates, in CI order:

```bash
npm run check
npm test
npm run build
```
