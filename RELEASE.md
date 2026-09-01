# Release — ZvaraShop

> Verified against disk: 2026-09-01 @ `e6b9fbe` + standalone/ad-signals working tree

This repository owns the ZvaraShop release. CI is a verification gate, not a
deployment system. Pushing a branch does not authorize production changes.

## Release gates

Run from a clean, reviewed release branch:

```bash
npm ci
npm run docs:check
npm test
npm run check
npm run build
npm run db:migrate:local
npm run preflight
```

Browser-visible changes also require a local browser check against the affected
route. A React island must be interacted with; static checks do not prove it
hydrated. Record skipped checks and their exact blockers.

## Migration contract

`src/db/migrations/` is the only schema source. Never edit an applied migration
in place. A release may add only a forward suffix. Runtime schema validation
rejects unknown, divergent, or ahead history before serving database-backed
routes.

Local migration proof is safe. Any `wrangler d1 ... --remote` command acts on
the live store and requires explicit production approval.

## Production action

After explicit approval, the operator reviews the exact commit and executes the
repository's deployment command:

```bash
npm run cf:deploy
```

Wrangler deploys the Worker configured by `wrangler.jsonc`. Do not add Cloudflare
credentials to source or CI, and do not introduce auto-deploy as a side effect
of unrelated work.

## Post-deploy evidence

Record the deployed commit/version and verify, without exposing customer data:

- public home and one product route return expected content;
- `/hello` loads and an authorized operator can sign in;
- checkout can reach location/rate selection without placing a real order;
- `/api/admin/health` reports schema and both Meta/Google outbox state;
- relevant Workers Logs contain no new stable-label failures.

Provider test events, real orders, remote D1 writes, and payment mutations need
their own explicit approval.

## Rollback

Code rollback means deploying a previously verified commit. Database rollback
is forward repair: never delete migration history or run a destructive reverse
migration. If a new migration is wrong, ship a new corrective migration and
keep the applied chain intact.
