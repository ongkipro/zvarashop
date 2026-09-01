# Local setup and environment — ZvaraShop

> Verified against disk: 2026-09-01 @ `e6b9fbe` + standalone/ad-signals working tree

ZvaraShop is already a provisioned single-store repository. This document owns
developer setup and binding requirements; it is not a generic multi-store
installer.

## Prerequisites

- Node.js 22 or newer and npm 10 or newer.
- Wrangler authenticated only when an approved Cloudflare operation is needed.
- Local development credentials supplied through the approved external secret
  mechanism. Never print or commit `.env`, `.dev.vars`, API tokens, passwords,
  sessions, payment data, or customer data.

## Setup

```bash
npm ci
npm run db:migrate:local
npm test
npm run check
npm run build
```

`npm run dev` is suitable for UI/markup work that does not need Worker
bindings. Use `npm run cf:dev` for D1, KV, R2, middleware, scheduled logic, or
binding-dependent behavior.

## Fixed binding names

- `OMS_DB` — D1 store, orders, config, sessions, limits, and outboxes.
- `SESSION` — cache and operational-alert transition state only.
- `ASSET_BUCKET` — merchant uploads in R2.
- `AI` — Workers AI binding.
- `ASSETS` — static asset binding.

The concrete resource identifiers and domains in `wrangler.jsonc` belong to
ZvaraShop. Do not replace them with placeholders or identifiers from another
store.

## Required secret names

`wrangler.jsonc` declares the required runtime names. Values stay outside Git.
Meta/Google direct tag identifiers may resolve D1-first with environment
fallback. Meta CAPI and Google Ads offline credentials are server-only and must
never be returned through a browser API.

## Local database

The ordered SQL files under `src/db/migrations/` are authoritative. Apply them
locally with `npm run db:migrate:local`. Any remote D1 command requires explicit
production approval; see [RELEASE.md](./RELEASE.md).
