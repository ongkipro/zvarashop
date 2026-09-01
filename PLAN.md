# PLAN — ZvaraShop standalone delivery

> Verified against disk: 2026-09-01 @ `e6b9fbe` + standalone/ad-signals working tree

## Direction

ZvaraShop evolves as one standalone product and store repository. AdsBookCMS is
lineage only. There is no product/install copy boundary, fleet updater, or blind
tree replacement.

## Change flow

1. Start feature work from the canonical ZvaraShop branch in a task worktree.
2. Capture base HEAD, pre-existing dirty paths, and allowed change surface.
3. Trace the affected runtime flow and reuse local helpers before adding code.
4. Add the smallest behavioral regression test for non-trivial logic.
5. Run `npm run docs:check`, `npm test`, `npm run check`, and `npm run build`.
6. Exercise browser-visible changes locally against the affected route.
7. Review migrations as an ordered forward suffix and run local D1 migration.
8. Commit, push, remote migration, and deploy only with the corresponding user
   authorization. Record production evidence in `RELEASE.md`/`BUILD-LOG.md`.

## External change intake

Useful work from AdsBookCMS, PermataMall, or another repository may be studied,
but it enters ZvaraShop as an ordinary port:

- understand the invariant and verify it still applies here;
- copy no merchant data, credentials, Cloudflare identifiers, or migration
  filename blindly;
- adapt the smallest diff to ZvaraShop's current schema and contracts;
- add local tests and document the resulting decision here.

`scripts/sync-from-product.sh` intentionally exits with an error so an old
operator habit cannot replace the standalone tree.

## Current sequence

- Harden Meta/Google signal correctness and admin configuration truthfulness.
- Add Google offline outbox health and alert evidence.
- Reconcile repository identity and canonical documentation.
- Validate all Markdown/local links, code, tests, build, and affected browser
  flows before proposing a production release.
