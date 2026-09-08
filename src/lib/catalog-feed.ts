import { getAdTaxonomy } from "./ad-taxonomy.ts";

export type CatalogProductVariant = {
  id: number | string;
  label: string;
  price: number;
  comparePrice?: number;
  sku?: string;
};

export type CatalogProduct = {
  productId: number | string;
  catalogId?: number | string;
  slug: string;
  productName: string;
  category?: string;
  headline?: string;
  description?: string;
  brand?: string;
  seoDescription?: string;
  heroImage: string;
  variants: CatalogProductVariant[];
};

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * The catalog identity scheme, and the one rule that governs everything here:
 * the `id` a feed publishes must be **exactly** the string the Pixel and CAPI
 * send as `content_ids`, or Advantage+ and Dynamic Product Ads have nothing to
 * match and catalog retargeting is silently dead.
 *
 * It was dead. The feed published `10001`, derived by adding 10000 to the row
 * id; the admin screen showed the operator that same `10001`; and the Pixel
 * sent the raw row id, `1`. Three values for one product.
 *
 * ZvaraShop uses one catalog item per product. The immutable D1 Product ID is
 * generated as a five-digit number, so product_id, content_id and feed <g:id>
 * are the same value. Variants remain checkout choices and do not create
 * separate catalog identities.
 *
 * - **Stable forever.** Google: "Once you've assigned an ID to a product, don't
 *   change it", and never reuse it, even for a deleted product. That rules out
 *   SKU as the basis, despite both platforms recommending it — `sku` here is
 *   nullable and merchant-editable, so it is exactly the thing that changes.
 *   Product IDs are allocated once and never edited.
 * - **Unambiguous in transit.** Decimal, no leading zero, minimum five digits.
 *   Legacy short IDs fail closed instead of being padded into a value that is
 *   no longer the real Product ID.
 *
 * A GTIN and an MPN are assigned by a manufacturer, and this schema has no
 * column for either — no product here can ever carry one. Google reads a
 * branded item with neither as *missing* data and warns or disapproves it, so
 * the Google feed states `identifier_exists: no`, which is the declaration that
 * case exists for. What it must never do again is answer the same question by
 * publishing the merchant-editable variant `sku` as `g:mpn`: that claimed a
 * manufacturer part number the product does not have, and the value changed
 * whenever an operator edited it.
 */

/** Canonical ads identity: the immutable numeric D1 Product ID. */
export function catalogProductId(productId: number | string): string {
  const value = String(productId).trim();
  if (!/^[1-9]\d{4,15}$/.test(value) || !Number.isSafeInteger(Number(value))) {
    throw new RangeError("Product ID katalog harus berupa angka minimal 5 digit.");
  }
  return value;
}

/**
 * The catalogue id, or null when this row cannot have one.
 *
 * `catalogProductId` fails closed on purpose — an ads payload must never carry
 * a padded or guessed identity. A *display* path has no such duty, and one
 * short id (an import, a hand-inserted row, a legacy migration) throwing
 * inside a React render blanks the entire admin product page. Screens read
 * through this; ads keep reading the strict function.
 */
export function catalogProductIdOrNull(productId: number | string): string | null {
  try {
    return catalogProductId(productId);
  } catch {
    return null;
  }
}

/**
 * The content id for a page where no variant has been chosen yet — a product
 * detail page or a landing page. The feed is product-level, while the first
 * variant remains the default price shown by the storefront.
 *
 * Returns `undefined` rather than a guess when the product has no variants.
 * A `content_ids` that matches nothing in the catalog is worse than none: it
 * reports a match rate that is real to Meta and meaningless to the merchant.
 */
export function defaultCatalogContentId(product: {
  productId: number | string;
  variants?: readonly { id: number | string }[];
}): string | undefined {
  const first = product.variants?.[0];
  if (!first) return undefined;
  return catalogProductIdOrNull(product.productId) ?? undefined;
}

/**
 * Platform field limits, and why they are enforced here rather than at the
 * admin boundary.
 *
 * Google Merchant Center caps `title` at 150 characters and `description` at
 * 5000; Meta's catalog caps them at 200 and 9999. Exceeding a cap does not
 * truncate the field — it **disapproves the item**, silently, for one product
 * at a time.
 *
 * `product-mutation.ts` accepts a title of up to 160 characters, so a title of
 * 151-160 saved cleanly and then vanished from the Google feed's approved set.
 * Raising the admin cap's ceiling is the wrong fix: the merchant's own record
 * is not Google's to constrain, and shortening it would lose data the
 * storefront legitimately shows. The feed is where a platform's limit applies,
 * so the feed is where it is met.
 *
 * Truncation is deliberate and is strictly better than the alternative: a
 * shortened title is listed, an over-length one is not listed at all.
 */
const GOOGLE_TITLE_MAX = 150;
const GOOGLE_DESCRIPTION_MAX = 5000;
const META_TITLE_MAX = 200;
const META_DESCRIPTION_MAX = 9999;

/** Trims on a word boundary where one is near enough to matter. */
export function clampFeedText(value: string, max: number): string {
  const text = value.trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  // `lastIndexOf` answers -1 when there is no space at all, and -1 clears any
  // negative threshold — which silently dropped the final character of every
  // unbroken value. The boundary trim only applies when a real space is close
  // enough that cutting there costs little.
  const useBoundary = lastSpace > 0 && lastSpace > max - 20;
  return (useBoundary ? cut.slice(0, lastSpace) : cut).trimEnd();
}

export function generateGoogleCatalogXml(
  products: CatalogProduct[],
  siteOrigin: string,
  title?: string,
  description?: string,
): string {
  const origin = siteOrigin.replace(/\/$/, "");
  const siteTitle = title || "ZvaraShop";
  const siteDescription = description || "Solusi Produk Berkualitas";

  let itemsXml = "";

  for (const product of products) {
    if (!product.variants || product.variants.length === 0) continue;

    const taxonomy = getAdTaxonomy(product.category, product.productName, product.description || product.headline);
    const productLink = `${origin}/produk/${product.slug}`;
    const imageLink = product.heroImage.startsWith("http") ? product.heroImage : `${origin}${product.heroImage}`;

    const variant = product.variants[0];
    const itemId = catalogProductIdOrNull(product.productId);
    if (!itemId) continue;
    // Omitted when no taxonomy rule was confident. Both platforms treat the
    // category as optional; a wrong one can cause feed disapproval.
    const googleCategoryXml = taxonomy.googleCategoryId
      ? `\n      <g:google_product_category>${taxonomy.googleCategoryId}</g:google_product_category>`
      : "";
    const titleText = product.productName;
    const hasSale = typeof variant.comparePrice === "number" && variant.comparePrice > variant.price;
    const basePriceFormatted = `${hasSale ? variant.comparePrice : variant.price} IDR`;
    const salePriceXml = hasSale
      ? `\n      <g:sale_price>${escapeXml(`${variant.price} IDR`)}</g:sale_price>`
      : "";
    const itemDescription = product.seoDescription || product.headline || product.description || siteDescription;

    itemsXml += `
    <item>
      <g:id>${escapeXml(itemId)}</g:id>
      <g:title>${escapeXml(clampFeedText(titleText, GOOGLE_TITLE_MAX))}</g:title>
      <g:description>${escapeXml(clampFeedText(itemDescription, GOOGLE_DESCRIPTION_MAX))}</g:description>
      <g:link>${escapeXml(productLink)}</g:link>
      <g:image_link>${escapeXml(imageLink)}</g:image_link>
      <g:availability>in_stock</g:availability>
      <g:price>${escapeXml(basePriceFormatted)}</g:price>${salePriceXml}
${googleCategoryXml}
      <g:product_type>${escapeXml(taxonomy.productType)}</g:product_type>
      <g:brand>${escapeXml(product.brand?.trim() || siteTitle)}</g:brand>
      <g:condition>new</g:condition>
      <g:identifier_exists>no</g:identifier_exists>
    </item>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXml(siteTitle)} - Google Merchant Catalog</title>
    <link>${escapeXml(origin)}</link>
    <description>${escapeXml(siteDescription)}</description>${itemsXml}
  </channel>
</rss>`;
}

export function generateMetaCatalogXml(
  products: CatalogProduct[],
  siteOrigin: string,
  title?: string,
  description?: string,
): string {
  const origin = siteOrigin.replace(/\/$/, "");
  const siteTitle = title || "ZvaraShop";
  const siteDescription = description || "Solusi Produk Berkualitas";

  let itemsXml = "";

  for (const product of products) {
    if (!product.variants || product.variants.length === 0) continue;

    const taxonomy = getAdTaxonomy(product.category, product.productName, product.description || product.headline);
    const productLink = `${origin}/produk/${product.slug}`;
    const imageLink = product.heroImage.startsWith("http") ? product.heroImage : `${origin}${product.heroImage}`;

    const variant = product.variants[0];
    const itemId = catalogProductIdOrNull(product.productId);
    if (!itemId) continue;
    const googleCategoryXml = taxonomy.googleCategoryId
      ? `\n      <g:google_product_category>${taxonomy.googleCategoryId}</g:google_product_category>`
      : "";
    const metaCategoryXml = taxonomy.metaCategoryName
      ? `\n      <g:fb_product_category>${escapeXml(taxonomy.metaCategoryName)}</g:fb_product_category>`
      : "";
    const titleText = product.productName;
    const hasSale = typeof variant.comparePrice === "number" && variant.comparePrice > variant.price;
    const basePriceFormatted = `${hasSale ? variant.comparePrice : variant.price} IDR`;
    const salePriceXml = hasSale
      ? `\n      <g:sale_price>${escapeXml(`${variant.price} IDR`)}</g:sale_price>`
      : "";
    const itemDescription = product.seoDescription || product.headline || product.description || siteDescription;

    itemsXml += `
    <item>
      <g:id>${escapeXml(itemId)}</g:id>
      <g:title>${escapeXml(clampFeedText(titleText, META_TITLE_MAX))}</g:title>
      <g:description>${escapeXml(clampFeedText(itemDescription, META_DESCRIPTION_MAX))}</g:description>
      <g:link>${escapeXml(productLink)}</g:link>
      <g:image_link>${escapeXml(imageLink)}</g:image_link>
      <g:availability>in_stock</g:availability>
      <g:price>${escapeXml(basePriceFormatted)}</g:price>${salePriceXml}
${metaCategoryXml}${googleCategoryXml}
      <g:product_type>${escapeXml(taxonomy.productType)}</g:product_type>
      <g:brand>${escapeXml(product.brand?.trim() || siteTitle)}</g:brand>
      <g:condition>new</g:condition>
    </item>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXml(siteTitle)} - Meta Commerce Catalog</title>
    <link>${escapeXml(origin)}</link>
    <description>${escapeXml(siteDescription)}</description>${itemsXml}
  </channel>
</rss>`;
}
