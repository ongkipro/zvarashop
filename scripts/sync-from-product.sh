#!/usr/bin/env bash
# Bring this store onto the latest AdsBookCMS.
#
# This store DOES share history with the product - unlike zanobyshop - but it is
# still replaced rather than merged, deliberately. It had drifted 112 commits
# behind while carrying 40 of its own, and in that window the product moved
# src/components/{home,shared,forms,tracking}/* under src/components/storefront/.
# A merge across that restructure is hundreds of modify/delete conflicts: it is
# a re-platform wearing a merge's clothes, and resolving it by hand is how a
# store ends up with two copies of every component. Replacing states the same
# outcome honestly.
#
# What the replace keeps: wrangler.jsonc and public/.
#
# This store used to re-apply an orange accent after every sync, through
# apply-store-palette.py. It no longer does: the storefront is deliberately the
# product's own, so that a sync leaves nothing to diverge and the store stays
# byte-identical to the CMS.
#
# What it does NOT keep, recorded so nobody looks for it: the Shopee-style
# flash-sale banner and stock progress that used to live in
# src/pages/produk/[slug].astro and src/styles/form-hybrid.css. Those two files
# are the ones the product improves most often - the checkout form - so freezing
# them was the more expensive option. The markup is in git history at d9804b2.
set -euo pipefail
cd "$(dirname "$0")/.."

git fetch -q product main
REV=$(git rev-parse --short product/main)
echo "product: $REV"

TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
git archive --format=tar product/main | tar -x -C "$TMP"

# Store-owned scripts survive the replace. Listed by name rather than diffed: a
# store script a sync silently deletes is a sync that quietly reverts the store.
STORE_SCRIPTS=(sync-from-product.sh)
mkdir -p "$TMP/keep"
for s in "${STORE_SCRIPTS[@]}"; do
  [ -f "scripts/$s" ] && cp "scripts/$s" "$TMP/keep/$s"
done

rm -rf src docs && cp -r "$TMP/src" src && cp -r "$TMP/docs" docs
rm -rf scripts && cp -r "$TMP/scripts" scripts
for s in "${STORE_SCRIPTS[@]}"; do
  [ -f "$TMP/keep/$s" ] && cp "$TMP/keep/$s" "scripts/$s" && chmod +x "scripts/$s"
done

for f in $(find "$TMP" -maxdepth 1 -type f -printf '%f\n'); do
  case "$f" in
    wrangler.jsonc|design-tokens.md) continue ;;   # store identity, never overwritten
  esac
  cp "$TMP/$f" "./$f"
done
cp -r "$TMP/public/." public/ 2>/dev/null || true

node scripts/generate-landing-safelist.mjs "$(python3 -c "
import re,pathlib
print(re.search(r'\"database_name\":\s*\"([^\"]+)\"', pathlib.Path('wrangler.jsonc').read_text()).group(1))")" || true
echo "synced to $REV - now: npm run build && wrangler d1 migrations apply <db> --remote && wrangler deploy"
