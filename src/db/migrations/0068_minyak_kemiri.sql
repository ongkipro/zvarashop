INSERT OR IGNORE INTO products (id, store_id, title, slug, category, brand, description, image_url, is_active, created_at)
VALUES (
  98823,
  1,
  'Minyak Kemiri Bakar Murni Penumbuh Rambut & Brewok 100ml',
  'minyak-kemiri',
  'Perawatan Rambut',
  'Al-Khodry',
  'Minyak kemiri bakar asli murni tanpa campuran untuk perawatan intensif penumbuh dan penyubur rambut, alis, bulu mata, dan brewok. Efektif menghentikan kerontokan, merangsang folikel rambut baru, menebalkan helaian rambut hitam berkilau, dan mencegah uban dini. Dilengkapi aplikator spoolie brush presisi.',
  '/images/landing/minyak-kemiri/hero-product.webp',
  1,
  datetime('now')
);
--> statement-breakpoint
INSERT OR IGNORE INTO product_variants (product_id, sku, title, price, compare_price, weight_grams, stock)
VALUES
  (98823, 'MKB-01', 'Beli 1 Botol (Paket Coba - 100ml)', 49000, 85000, 150, 99),
  (98823, 'MKB-02', 'Beli 2 Botol (Paket Hemat - 2x 100ml)', 89000, 170000, 300, 99),
  (98823, 'MKB-03', 'Beli 3 Botol (Paket Best Seller + Free Spoolie Brush)', 119000, 255000, 450, 99),
  (98823, 'MKB-05', 'Beli 5 Botol (Paket Terapi Tuntas - 5x 100ml)', 169000, 425000, 750, 99);
--> statement-breakpoint
INSERT INTO landing_pages
  (id, slug, title, product_id, is_active, is_product_page, meta_title, meta_description, source, created_at, updated_at)
VALUES
  ('native:minyak-kemiri', 'minyak-kemiri', 'Minyak Kemiri Bakar Murni Penumbuh Rambut & Brewok 100ml', '98823', 1, 0, 'Minyak Kemiri Bakar Murni Penumbuh Rambut & Brewok 100ml Asli', 'Minyak kemiri bakar murni 100ml penumbuh dan penyubur rambut rontok, alis, bulu mata, dan brewok lebat alami. Garansi 100% original tanpa campuran.', 'native', datetime('now'), datetime('now'))
ON CONFLICT(id) DO UPDATE SET
  slug = excluded.slug,
  title = excluded.title,
  product_id = excluded.product_id,
  is_active = 1,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  updated_at = excluded.updated_at;
