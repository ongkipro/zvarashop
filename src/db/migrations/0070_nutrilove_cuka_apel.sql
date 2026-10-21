INSERT OR IGNORE INTO products (id, store_id, title, slug, category, brand, description, image_url, is_active, created_at)
VALUES (
  17981,
  1,
  'Cuka Sari Apel 100% Original',
  'cuka-sari-apel-100-original',
  'Herbal & Kesehatan',
  'NutriLove',
  'NutriLove Cuka Sari Apel With The Mother murni 100% hasil fermentasi alami buah apel segar tanpa pemanasan (raw unfiltered). Mengandung asam asetat aktif, enzim protease, dan pektin untuk membantu meluruhkan plak lemak kolesterol, melancarkan peredaran darah, meredakan leher kaku berat, dan menjaga stamina tubuh.',
  '/images/landing/nutrilove-cuka-apel/hero-banner.webp',
  1,
  datetime('now')
);
--> statement-breakpoint
INSERT OR IGNORE INTO product_variants (id, product_id, sku, title, price, compare_price, weight_grams, stock)
VALUES
  (20116, 17981, 'NTR-01', 'BELI 1 Dapat 3', 97500, 199000, 1500, 99);
--> statement-breakpoint
INSERT INTO landing_pages
  (id, slug, title, product_id, is_active, is_product_page, meta_title, meta_description, source, created_at, updated_at)
VALUES
  ('native:nutrilove-cuka-apel', 'nutrilove-cuka-apel', 'NutriLove Cuka Apel With The Mother', '17981', 1, 1, 'NutriLove Cuka Apel With The Mother — Solusi Alami Tengkuk Kaku & Kolesterol Tinggi', 'Tengkuk sering kaku dan leher belakang berat habis makan santan? Terapi alami NutriLove Cuka Apel With The Mother bantu kikis plak kolesterol dan lancarkan peredaran darah.', 'native', datetime('now'), datetime('now'))
ON CONFLICT(id) DO UPDATE SET
  slug = excluded.slug,
  title = excluded.title,
  product_id = excluded.product_id,
  is_active = 1,
  is_product_page = 1,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  updated_at = excluded.updated_at;
