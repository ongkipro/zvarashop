INSERT OR IGNORE INTO products (id, store_id, title, slug, category, brand, description, image_url, is_active, created_at)
VALUES (
  20173,
  1,
  '4G Lucky Spray Herbal Pria Dewasa',
  '4g-lucky',
  'Kesehatan Pria',
  '4G Lucky',
  'Spray herbal khusus pria dewasa dengan formula Intimate Hygiene. Membantu meningkatkan stamina, mengatasi ejakulasi dini, melancarkan peredaran darah ke area vital, serta menjaga kebersihan Mr. P. Nyaman digunakan tanpa rasa kebas dan tanpa efek samping jantung berdebar.',
  '/assets/uploads/2026-10-07/5e5bea86-165f-4098-8d34-00bbee09bf3f.webp',
  1,
  datetime('now')
);
--> statement-breakpoint
INSERT OR IGNORE INTO product_variants (id, product_id, sku, title, price, compare_price, weight_grams, stock)
VALUES
  (20114, 20173, '4GL-01', 'Beli 1 Botol (Paket Coba)', 147500, 165000, 100, 99),
  (20115, 20173, '4GL-02', 'Beli 2 Botol (Paket Hemat Rekomendasi)', 290500, 330000, 200, 99);
--> statement-breakpoint
INSERT INTO landing_pages
  (id, slug, title, product_id, is_active, is_product_page, meta_title, meta_description, source, created_at, updated_at)
VALUES
  ('native:4g-lucky', '4g-lucky', '4G Lucky Spray Herbal Pria Dewasa (Intimate Hygiene)', '20173', 1, 1, '4G Lucky Spray Herbal Pria Dewasa — Tahan Lama & Perkasa', 'Spray herbal pria dewasa 4G Lucky formula intimate hygiene. Bikin ereksi kokoh, tahan lama beronde-ronde tanpa kebas dan tanpa efek samping. Garansi privasi aman & bisa COD.', 'native', datetime('now'), datetime('now'))
ON CONFLICT(id) DO UPDATE SET
  slug = excluded.slug,
  title = excluded.title,
  product_id = excluded.product_id,
  is_active = 1,
  is_product_page = 1,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  updated_at = excluded.updated_at;
