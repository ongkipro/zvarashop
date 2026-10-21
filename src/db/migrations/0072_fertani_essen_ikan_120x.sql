INSERT OR IGNORE INTO products (id, store_id, title, slug, category, brand, description, image_url, is_active, created_at)
VALUES (
  76738,
  1,
  'Fertani Essen Ikan 120x',
  'fertani-essen-ikan-120x',
  'Hobi & Olahraga',
  'Fertani Essen Ikan',
  'Fertani Essen Ikan 120X isi 30 kapsul formula konsentrat perangsang nafsu makan ikan kolam lele, nila, mas, patin, mujair, dan bawal. Praktis tanpa bau amis di tangan, tahan lama di titik lemparan, bisa bayar di tempat (COD).',
  '/images/landing/essen-ikan-120x/hero-product.webp',
  1,
  datetime('now')
);
--> statement-breakpoint
INSERT OR IGNORE INTO product_variants (id, product_id, sku, title, price, compare_price, weight_grams, stock)
VALUES
  (20089, 76738, 'FEI-01', 'Beli 1 (30 Kapsul)', 71500, 85000, 150, 100),
  (20090, 76738, 'FEI-02', 'Beli 2 (60 Kapsul - Hemat)', 139000, 170000, 300, 100);
--> statement-breakpoint
INSERT INTO landing_pages
  (id, slug, title, product_id, is_active, is_product_page, meta_title, meta_description, source, created_at, updated_at)
VALUES
  ('native:fertani-essen-ikan-120x', 'fertani-essen-ikan-120x', 'Fertani Essen Ikan 120X (Formula Konsentrat Kapsul Pemikat Ikan Kolam)', '76738', 1, 1, 'Fertani Essen Ikan 120X — Rahasia Umpan Gacor Anti Boncos', 'Fertani Essen Ikan 120X formula konsentrat kapsul pemikat nafsu makan ikan kolam lele, mas, nila, patin, bawal. Bikin strike bertubi-tubi tanpa bau amis di tangan. Bisa COD se-Indonesia.', 'native', datetime('now'), datetime('now'))
ON CONFLICT(id) DO UPDATE SET
  slug = excluded.slug,
  title = excluded.title,
  product_id = excluded.product_id,
  is_active = 1,
  is_product_page = 1,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  updated_at = excluded.updated_at;
