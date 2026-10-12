UPDATE products
SET
  brand = 'GlowHome',
  image_url = '/images/landing/foam-toilet/hero-product.webp',
  description = 'GlowHome Foam Pembersih Toilet 500ml busa aktif pembersih kerak, jamur, noda air membandel pada kloset, wastafel, dan keramik. Bersih mengkilap tanpa sikat keras, 99.99% basmi kuman, aroma harum segar, bisa COD se-Indonesia.'
WHERE id = 18399;
--> statement-breakpoint
INSERT INTO landing_pages
  (id, slug, title, product_id, is_active, is_product_page, meta_title, meta_description, source, created_at, updated_at)
VALUES
  ('native:foam-pembersih-toilet-500ml', 'foam-pembersih-toilet-500ml', 'GlowHome Foam Pembersih Toilet 500ml (Busa Aktif Pembersih Kerak & Noda Kloset)', '18399', 1, 1, 'GlowHome Foam Pembersih Toilet 500ml — Busa Aktif Rontokkan Kerak Toilet Seketika', 'GlowHome Foam Pembersih Toilet 500ml busa aktif pembersih kerak, jamur, noda air membandel pada kloset, wastafel, dan keramik. Bersih mengkilap tanpa sikat keras, 99.99% basmi kuman, aroma harum segar, bisa COD se-Indonesia.', 'native', datetime('now'), datetime('now'))
ON CONFLICT(id) DO UPDATE SET
  slug = excluded.slug,
  title = excluded.title,
  product_id = excluded.product_id,
  is_active = 1,
  is_product_page = 1,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  updated_at = excluded.updated_at;
