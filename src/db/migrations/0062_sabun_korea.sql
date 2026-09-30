INSERT OR IGNORE INTO products (id, store_id, title, slug, category, brand, description, image_url, is_active, created_at)
VALUES (
  98822,
  1,
  'Sabun Korea Glowing Pemutih Badan & Wajah 140g',
  'sabun-korea',
  'Perawatan Diri',
  'Aekyung Prime',
  'Sabun batang pemutih badan dan wajah khas Korea dengan busa lembut melimpah. Diperkaya Lanolin Oil dan Glycerin untuk mengangkat daki menumpuk, meratakan kulit belang, dan mencerahkan area lipatan tanpa membuat kulit kering. 100% Original BPOM NA18200500036.',
  '/images/landing/sabun-korea/hero-product.webp',
  1,
  datetime('now')
);
--> statement-breakpoint
INSERT OR IGNORE INTO product_variants (product_id, sku, title, price, compare_price, weight_grams, stock)
VALUES
  (98822, 'SK-01', 'Beli 1 (Paket Coba - 1 Sabun)', 49000, 85000, 140, 99),
  (98822, 'SK-02', 'Beli 2 (Paket Hemat - 2 Sabun)', 89000, 170000, 280, 99),
  (98822, 'SK-03', 'Beli 3 (Paket Glowing Best Seller - 3 Sabun)', 119000, 255000, 420, 99),
  (98822, 'SK-05', 'Beli 5 (Paket Perawatan Lengkap - 5 Sabun)', 169000, 425000, 700, 99);
--> statement-breakpoint
INSERT INTO landing_pages
  (id, slug, title, product_id, is_active, is_product_page, meta_title, meta_description, source, created_at, updated_at)
VALUES
  ('native:sabun-korea', 'sabun-korea', 'Sabun Korea Glowing Pemutih Badan & Wajah 140g (BPOM Original)', '98822', 1, 0, 'Sabun Korea Glowing Pemutih Badan & Wajah 140g (BPOM Original)', 'Landing page direct-response konversi tinggi untuk Sabun Korea Glowing Pemutih Badan & Wajah 140g BPOM.', 'native', datetime('now'), datetime('now'))
ON CONFLICT(id) DO UPDATE SET
  slug = excluded.slug,
  title = excluded.title,
  product_id = excluded.product_id,
  is_active = 1,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  updated_at = excluded.updated_at;
