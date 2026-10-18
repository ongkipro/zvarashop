-- Reconstructed 2026-10-18. Production applied this migration on
-- 2026-10-13 16:15:03 UTC from a checkout that was never pushed; its file
-- was lost. The statements below rebuild, idempotently, the production rows
-- it introduced as they stood when recovered (1 native landing page(s)
-- and their products), so a local database matches production. Production
-- never re-runs it: d1_migrations already records the name.

INSERT OR IGNORE INTO products
  (id, store_id, title, slug, category, is_active, created_at, image_url, brand, description)
VALUES
  (99825, 1, '[Theravol] Wamena Oil - Minyak Herbal Pria BPOM', 'wamena-oil', 'Herbal & Vitalitas Pria', 1, '2026-10-13 16:15:03', '/images/landing/wamena-oil/hero-product.webp', 'Naturmax', 'Wamena Oil adalah minyak urut perawatan pria herbal alami dari ramuan tradisional Papua terbaik. Terdaftar resmi BPOM NA18230110127. Membantu melancarkan sirkulasi darah, merawat vitalitas pria secara alami, aman digunakan, dan privasi pengiriman terjamin rapat (bisa COD).');
--> statement-breakpoint
INSERT OR IGNORE INTO product_variants
  (id, product_id, sku, title, price, compare_price, weight_grams, stock)
VALUES
  (20119, 99825, 'WMO-01', 'Beli 1 Botol (Isi 60ml)', 85000, 125000, 100, 9985),
  (20120, 99825, 'WMO-02', 'Beli 2 Botol (Paket Hemat Sepasang)', 149000, 250000, 200, 9985),
  (20121, 99825, 'WMO-03', 'Beli 3 Botol (Paket Super Hemat - Paling Laris)', 199000, 375000, 300, 9985);
--> statement-breakpoint
INSERT INTO landing_pages
  (id, slug, title, product_id, is_active, is_product_page, meta_title, meta_description, source, created_at, updated_at)
VALUES
  ('native:wamena-oil', 'wamena-oil', 'Wamena Oil Minyak Herbal Pria Papua BPOM', '99825', 1, 1, 'Wamena Oil Minyak Herbal Pria Papua BPOM', 'Landing page direct-response konversi tinggi untuk Wamena Oil Minyak Herbal Perawatan Vitalitas Pria Tradisional Papua BPOM.', 'native', '2026-10-13 16:15:03', '2026-10-13T17:07:37.441Z')
ON CONFLICT(id) DO UPDATE SET
  slug = excluded.slug,
  title = excluded.title,
  product_id = excluded.product_id,
  is_active = excluded.is_active,
  is_product_page = excluded.is_product_page,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  updated_at = excluded.updated_at;
