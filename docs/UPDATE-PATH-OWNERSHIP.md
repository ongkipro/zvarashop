# External change intake — ZvaraShop

> Verified against disk: 2026-09-01 @ `e6b9fbe` + standalone/ad-signals working tree

This file supersedes the former product/install path-ownership manifest.
ZvaraShop owns every tracked application, configuration, migration, asset, and
document path in this repository. No path is periodically overwritten from an
upstream product repository.

## Rules

- Treat an external repository as a reference, never as a synchronization
  source.
- Port changes on a ZvaraShop feature branch and review the resulting local
  diff.
- Never copy `wrangler.jsonc`, secret files, resource identifiers, merchant
  assets, database rows, or migration filenames from another store.
- Never edit or renumber an applied migration. Re-express a useful schema
  change as the next valid ZvaraShop forward migration after checking the full
  local chain.
- Preserve compatibility identifiers that are already live, including cookie
  names, API-key prefixes, binding names, D1 columns, and audit event labels.
- Require the normal ZvaraShop test, check, build, local migration, and browser
  gates; provenance does not weaken verification.

The legacy `product` Git remote may remain fetch-only as a human convenience,
but it has no authority. `origin` and the checked-out ZvaraShop repository are
the only release source.
