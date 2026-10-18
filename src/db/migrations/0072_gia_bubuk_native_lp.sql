-- Reconstructed 2026-10-18. Production applied this migration on
-- 2026-10-13 21:57:37 UTC from a checkout that was never pushed; its file
-- was lost. The statements below rebuild, idempotently, the production rows
-- it introduced as they stood when recovered (1 native landing page(s)
-- and their products), so a local database matches production. Production
-- never re-runs it: d1_migrations already records the name.

UPDATE products
SET
  title = 'Gia Bubuk Anti Tersumbat 110gri',
  category = 'Umum',
  brand = 'Bubuk Anti Tersumbat 110gr',
  image_url = '/images/landing/gia-bubuk-anti-tersumbat/seller-3.webp',
  description = NULL
WHERE id = 43287;
--> statement-breakpoint
INSERT INTO landing_pages
  (id, slug, title, product_id, is_active, is_product_page, meta_title, meta_description, source, created_at, updated_at)
VALUES
  ('native:gia-bubuk-anti-tersumbat', 'gia-bubuk-anti-tersumbat', 'GIA Bubuk Anti Tersumbat 110gr (2 Menit Langsung Lancar)', '43287', 1, 1, 'GIA Bubuk Anti Tersumbat 110gr (2 Menit Langsung Lancar)', 'Landing page direct-response konversi tinggi untuk GIA Bubuk Anti Tersumbat 110gr kemasan sachet konsentrat peluruh sumbatan pipa, wastafel, dan kloset WC.', 'native', '2026-10-13 21:50:57', '2026-10-13T22:07:36.853Z')
ON CONFLICT(id) DO UPDATE SET
  slug = excluded.slug,
  title = excluded.title,
  product_id = excluded.product_id,
  is_active = excluded.is_active,
  is_product_page = excluded.is_product_page,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  updated_at = excluded.updated_at;
