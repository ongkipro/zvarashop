-- Reconstructed 2026-10-18. Production applied this migration on
-- 2026-10-13 15:37:50 UTC from a checkout that was never pushed; its file
-- was lost. The statements below rebuild, idempotently, the production rows
-- it introduced as they stood when recovered (1 native landing page(s)
-- and their products), so a local database matches production. Production
-- never re-runs it: d1_migrations already records the name.

INSERT OR IGNORE INTO products
  (id, store_id, title, slug, category, is_active, created_at, image_url, brand, description)
VALUES
  (99824, 1, 'Alat Cukur Travel Pocket', 'alat-cukur-travel-pocket', 'Elektronik & Gadget', 1, '2026-10-13 15:37:50', '/images/landing/alat-cukur-travel-pocket/hero-product.webp', 'Pocket Shaver', 'Alat Cukur Travel Pocket elektrik portable rechargeable USB Type-C. Desain mini seukuran saku dengan mata pisau baja anti-karat hypoallergenic. Cukur bersih, mulus tanpa iritasi kulit. Praktis dibawa bepergian, bisa bayar di tempat (COD).');
--> statement-breakpoint
INSERT OR IGNORE INTO product_variants
  (id, product_id, sku, title, price, compare_price, weight_grams, stock)
VALUES
  (20116, 99824, 'ACTP-01', 'Beli 1 Pcs (Hitam)', 89000, 129000, 100, 500),
  (20117, 99824, 'ACTP-02', 'Beli 2 Pcs (Paket Hemat Sepasang)', 149000, 258000, 200, 500),
  (20118, 99824, 'ACTP-03', 'Beli 3 Pcs (Paket Super Hemat)', 199000, 387000, 300, 500);
--> statement-breakpoint
INSERT INTO landing_pages
  (id, slug, title, product_id, is_active, is_product_page, meta_title, meta_description, source, created_at, updated_at)
VALUES
  ('native:alat-cukur-travel-pocket', 'alat-cukur-travel-pocket', 'Alat Cukur Travel Pocket Portable USB Mini Shaver', '99824', 1, 1, 'Alat Cukur Travel Pocket Portable USB Mini Shaver', 'Landing page direct-response konversi tinggi untuk Alat Cukur Listrik Portable Travel Pocket USB Type-C.', 'native', '2026-10-13 15:37:50', '2026-10-13T16:07:37.496Z')
ON CONFLICT(id) DO UPDATE SET
  slug = excluded.slug,
  title = excluded.title,
  product_id = excluded.product_id,
  is_active = excluded.is_active,
  is_product_page = excluded.is_product_page,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  updated_at = excluded.updated_at;
