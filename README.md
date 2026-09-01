# ZvaraShop

> Verified against disk: 2026-09-01 @ `e6b9fbe` + standalone/ad-signals working tree

ZvaraShop is the standalone source repository for the direct-response commerce
store served at `zvara.shop`. It contains the storefront, admin, checkout,
orders, logistics, payments, landing pages, ad-signal pipelines, database
migrations, Cloudflare Worker configuration, and release procedure for this one
store.

The code originated from AdsBookCMS. That name is historical lineage, not an
upstream ownership boundary: changes are now developed, reviewed, migrated, and
released here. Compatibility identifiers such as `adsbook_session`, API-key
prefixes, migration filenames, and D1 column names remain stable because
renaming them would break live sessions, keys, or schema history.

## Local development

Requirements: Node.js 22+, npm 10+, and Wrangler for local Worker/D1 behavior.

```bash
npm ci
npm run db:migrate:local
npm test
npm run check
npm run build
```

Use `npm run dev` for markup-only local work and `npm run cf:dev` when the flow
depends on D1, KV, R2, middleware, or Worker bindings. Never read or commit
secret values; see [INSTALLATION.md](./INSTALLATION.md).

## Repository map

- `src/pages/` — storefront, admin, feeds, and API routes.
- `src/lib/` — commerce, auth, providers, tracking, and tests.
- `src/db/migrations/` — the only schema source; migrations are forward-only.
- `src/components/` — storefront and admin UI.
- `public/` — ZvaraShop-owned public assets.
- `scripts/` — local validation and operational helpers.
- `wrangler.jsonc` — ZvaraShop's real Worker/resource configuration.

## Canonical documents

- [AGENTS.md](./AGENTS.md) — working and approval rules.
- [ARCHITECTURE.md](./ARCHITECTURE.md) — the system actually built.
- [PRD.md](./PRD.md) and [TASKS.md](./TASKS.md) — product requirements and execution queue.
- [DECISIONS.md](./DECISIONS.md) — append-only architecture decisions.
- [STATUS.md](./STATUS.md) — current repository and runtime evidence.
- [RELEASE.md](./RELEASE.md) — verification, migration, deploy, and rollback.
- [OBSERVABILITY.md](./OBSERVABILITY.md) — logs, health signals, and alerts.
- [TRACKING_SPECS.md](./TRACKING_SPECS.md) — Meta/Google signal contract.

Point-in-time audits and handovers are historical evidence, not current source
of truth. Validate documentation structure and local links with:

```bash
npm run docs:check
```

CI runs check, tests, and build. It intentionally does not deploy. Production
deployment and remote D1 operations require explicit operator approval.
