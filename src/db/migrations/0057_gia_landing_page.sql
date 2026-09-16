UPDATE landing_pages
SET is_active = 0, is_product_page = 0
WHERE slug = 'pembersih-saluran-tersumbat' OR id = 'native:pembersih-saluran-tersumbat';
--> statement-breakpoint
INSERT INTO landing_pages
  (id, slug, title, product_id, is_active, is_product_page, meta_title, meta_description, source, created_at, updated_at)
VALUES
  ('native:gia-anti-sumbat', 'gia-anti-sumbat', 'GIA Serbuk Anti Tersumbat 110g (Formula Kristal Melancarkan Pipa)', '82215', 1, 0, 'GIA Serbuk Anti Tersumbat 110g (Formula Kristal Melancarkan Pipa)', 'Landing page direct-response konversi tinggi untuk GIA Serbuk Anti Tersumbat 110g peluruh lemak dan rambut.', 'native', datetime('now'), datetime('now'))
ON CONFLICT(id) DO UPDATE SET
  slug = excluded.slug,
  title = excluded.title,
  product_id = excluded.product_id,
  is_active = 1,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  updated_at = excluded.updated_at;
