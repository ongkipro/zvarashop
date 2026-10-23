INSERT OR IGNORE INTO products
  (id, store_id, title, slug, category, is_active, created_at, image_url, brand, description)
VALUES
  (39270, 1, 'Celana Knit Jumbo', 'celana-knit-jumbo', 'Fashion Wanita', 1, datetime('now'), '/assets/uploads/2026-10-23/578ade35-91e2-40e6-b69b-04e1e3097ea4.webp', 'Zvara Fashion', 'Celana Knit Jumbo model kulot longgar tanpa saku berbahan Knit Rib Premium yang lembut, adem, dan stretchy dengan pinggang full karet elastis untuk ukuran Jumbo (BB 55-70 kg) dan Super Jumbo (BB 70-85 kg).');
--> statement-breakpoint
UPDATE products
SET
  description = 'Celana Knit Jumbo model kulot longgar tanpa saku berbahan Knit Rib Premium yang lembut, adem, dan stretchy dengan pinggang full karet elastis untuk ukuran Jumbo (BB 55-70 kg) dan Super Jumbo (BB 70-85 kg).'
WHERE id = 39270;
--> statement-breakpoint
INSERT OR IGNORE INTO product_variants
  (id, product_id, sku, title, price, compare_price, weight_grams, stock)
VALUES
  (20183, 39270, 'CKJ-01', 'BUY 1 GET 2', 99000, 130000, 400, 999),
  (20184, 39270, 'CKJ-02', 'BUY 2 GET 4', 195000, 260000, 800, 999);
--> statement-breakpoint
INSERT INTO landing_pages
  (id, slug, title, product_id, is_active, is_product_page, meta_title, meta_description, source, created_at, updated_at)
VALUES
  ('native:celana-knit-jumbo', 'celana-knit-jumbo', 'Celana Knit Jumbo Kulot Rib Adem Melar BB 55-85 Kg', '39270', 1, 1, 'Celana Knit Jumbo Kulot Rib Adem Melar BB 55-85 Kg - Zvara Shop', 'Celana Knit Jumbo model kulot longgar berbahan knit rib lembut, adem, dan melar dengan pinggang full karet elastis untuk ukuran BB 55 hingga 85 kg.', 'native', datetime('now'), datetime('now'))
ON CONFLICT(id) DO UPDATE SET
  slug = excluded.slug,
  title = excluded.title,
  product_id = excluded.product_id,
  is_active = 1,
  is_product_page = 1,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  updated_at = excluded.updated_at;
