-- Reconstructed 2026-10-18. Production applied this migration on
-- 2026-10-13 17:38:22 UTC from a checkout that was never pushed; its file
-- was lost. The statements below rebuild, idempotently, the production rows
-- it introduced as they stood when recovered (22 native landing page(s)
-- and their products), so a local database matches production. Production
-- never re-runs it: d1_migrations already records the name.

INSERT OR IGNORE INTO products
  (id, store_id, title, slug, category, is_active, created_at, image_url, brand, description)
VALUES
  (99841, 1, 'Asam Humat Premium 500gr — Pembenah Tanah Organik & Penyubur Akar', 'asam-humat-premium', 'Agrikultur & Perkebunan', 1, '2026-10-13 17:38:22', '/images/landing/asam-humat-premium/hero-product.webp', 'PG Store Agro', 'Pembenah tanah organik Asam Humat (Humic Acid) kemasan 500 gram. Membantu menggemburkan tanah keras/masam, memaksimalkan penyerapan pupuk NPK, dan merangsang pertumbuhan akar tanaman.');
--> statement-breakpoint
INSERT OR IGNORE INTO product_variants
  (id, product_id, sku, title, price, compare_price, weight_grams, stock)
VALUES
  (20170, 99841, 'AHP-01', 'Beli 1 Pouch (500 Gram)', 89000, 125000, 500, 411),
  (20171, 99841, 'AHP-02', 'Paket 2 Pouch (1 Kg - Hemat Ongkir)', 159000, 250000, 1000, 411),
  (20172, 99841, 'AHP-03', 'Paket 3 Pouch (1,5 Kg - Lahan Kebun)', 219000, 375000, 1500, 411);
--> statement-breakpoint
UPDATE products
SET
  title = 'Deterjen Pakaian Dalam 300ml',
  category = 'Umum',
  brand = NULL,
  image_url = '/images/landing/deterjen-pakaian-dalam-300ml/hero-product.webp',
  description = 'GlowHome Lingerie Wash 300ml adalah cairan pembersih khusus pakaian dalam wanita dengan formula enzim aktif lembut untuk membantu mengangkat noda darah haid, noda kekuningan, dan bau tak sedap tanpa merusak serat kain.'
WHERE id = 65015;
--> statement-breakpoint
INSERT OR IGNORE INTO products
  (id, store_id, title, slug, category, is_active, created_at, image_url, brand, description)
VALUES
  (99834, 1, 'Bundling Dragon Blood Cream 50g (Beli 1 Gratis 1 — Dapat 2 Pot)', 'dragon-blood-cream', 'Kecantikan & Perawatan Wajah', 1, '2026-10-13 17:38:22', '/images/landing/dragon-blood-cream/hero-product.webp', 'Cherbal', 'Paket bundling hemat Dragon Blood Cream 50g (1 paket langsung dapat 2 pot). Krim pelembap bertekstur ringan untuk merawat kelembapan, kecerahan alami, dan tampilan kulit wajah yang halus.');
--> statement-breakpoint
INSERT OR IGNORE INTO product_variants
  (id, product_id, sku, title, price, compare_price, weight_grams, stock)
VALUES
  (20149, 99834, 'DBC-01', '1 Paket Bundling (Dapat 2 Pot @50g)', 139000, 198000, 250, 440),
  (20150, 99834, 'DBC-02', '2 Paket Bundling (Dapat 4 Pot - Hemat)', 239000, 396000, 500, 440),
  (20151, 99834, 'DBC-03', '3 Paket Bundling (Dapat 6 Pot - Lengkap)', 329000, 594000, 750, 440);
--> statement-breakpoint
UPDATE products
SET
  title = 'Fertani - Herbisida Pembasmi Rumput 250gram',
  category = 'Umum',
  brand = NULL,
  image_url = '/images/landing/fertani-herbisida/hero-product.webp',
  description = 'Fertani Herbisida Pembasmi Rumput 250gr adalah cairan pengendali gulma dan rumput liar hingga ke akar untuk halaman rumah, kebun, dan lahan pertanian. Praktis digunakan dan bekerja tuntas.'
WHERE id = 71823;
--> statement-breakpoint
INSERT OR IGNORE INTO products
  (id, store_id, title, slug, category, is_active, created_at, image_url, brand, description)
VALUES
  (99839, 1, 'Fertani Suplemen Penggemuk Ikan Air Tawar 250gr — Campuran Pakan Pelet', 'fertani-penggemuk-ikan', 'Agrikultur & Perikanan', 1, '2026-10-13 17:38:22', '/images/landing/fertani-penggemuk-ikan/hero-product.webp', 'Fertani', 'Suplemen premix nutrisi pakan ikan air tawar 250gr (lele, nila, gurame, patin, bawal, mujair, dan udang). Membantu meningkatkan nafsu makan ikan dan efisiensi penyerapan nutrisi pelet.');
--> statement-breakpoint
INSERT OR IGNORE INTO product_variants
  (id, product_id, sku, title, price, compare_price, weight_grams, stock)
VALUES
  (20164, 99839, 'FPI-01', 'Beli 1 Botol (250gr)', 69000, 99000, 250, 368),
  (20165, 99839, 'FPI-02', 'Paket 2 Botol (500gr - Kolam Budidaya)', 125000, 198000, 500, 368),
  (20166, 99839, 'FPI-03', 'Paket 3 Botol (750gr - Panen Maksimal)', 169000, 297000, 750, 368);
--> statement-breakpoint
INSERT OR IGNORE INTO products
  (id, store_id, title, slug, category, is_active, created_at, image_url, brand, description)
VALUES
  (99832, 1, 'Tablet Ginseng Cordyceps Sinensis Ochiban 500mg — Suplemen Stamina', 'ginseng-cordyceps', 'Herbal & Vitalitas', 1, '2026-10-13 17:38:22', '/images/landing/ginseng-cordyceps/hero-product.webp', 'Cherbal', 'Suplemen kombinasi ekstrak Ginseng dan Cordyceps Sinensis 500mg untuk membantu menjaga vitalitas, stamina kerja harian, dan daya tahan tubuh agar tidak mudah lelah.');
--> statement-breakpoint
INSERT OR IGNORE INTO product_variants
  (id, product_id, sku, title, price, compare_price, weight_grams, stock)
VALUES
  (20143, 99832, 'GCO-01', 'Beli 1 Botol', 99000, 149000, 150, 3935),
  (20144, 99832, 'GCO-02', 'Paket 2 Botol (Hemat Stamina)', 179000, 298000, 300, 3935),
  (20145, 99832, 'GCO-03', 'Paket 3 Botol (Persediaan 2 Bulan)', 249000, 447000, 450, 3935);
--> statement-breakpoint
INSERT OR IGNORE INTO products
  (id, store_id, title, slug, category, is_active, created_at, image_url, brand, description)
VALUES
  (99828, 1, 'Kapsul Herbal Brotowali Alami (Isi 50 Kapsul)', 'kapsul-herbal-brotowali', 'Herbal & Daya Tahan Tubuh', 1, '2026-10-13 17:38:22', '/images/landing/kapsul-herbal-brotowali/hero-product.webp', 'PG Store Herbal', 'Ekstrak herbal brotowali murni dalam kemasan 50 kapsul praktis tanpa rasa pahit di lidah. Membantu menjaga daya tahan tubuh, kebugaran metabolisme, dan meredakan pegal linu harian.');
--> statement-breakpoint
INSERT OR IGNORE INTO product_variants
  (id, product_id, sku, title, price, compare_price, weight_grams, stock)
VALUES
  (20131, 99828, 'KHB-01', 'Beli 1 Botol (Isi 50 Kapsul)', 99000, 135000, 100, 912),
  (20132, 99828, 'KHB-02', 'Paket 2 Botol (Hemat Keluarga)', 179000, 270000, 200, 912),
  (20133, 99828, 'KHB-03', 'Paket 3 Botol (Stok Rutin)', 249000, 405000, 300, 912);
--> statement-breakpoint
INSERT OR IGNORE INTO products
  (id, store_id, title, slug, category, is_active, created_at, image_url, brand, description)
VALUES
  (99842, 1, 'Kapsul Herbal Gurah 60 Kapsul — Perawatan Tenggorokan & Pernapasan BPOM', 'kapsul-herbal-gurah', 'Herbal & Kesehatan', 1, '2026-10-13 17:38:22', '/images/landing/kapsul-herbal-gurah/hero-product.webp', 'PG Store Herbal', 'Suplemen herbal tradisional isi 60 kapsul terdaftar resmi BPOM (TR213305391) dengan ekstrak Senggugu dan Habbatussauda untuk membantu meredakan batuk berdahak dan melegakan tenggorokan.');
--> statement-breakpoint
INSERT OR IGNORE INTO product_variants
  (id, product_id, sku, title, price, compare_price, weight_grams, stock)
VALUES
  (20173, 99842, 'KHG-01', 'Beli 1 Botol (Isi 60 Kapsul BPOM)', 79000, 115000, 100, 403),
  (20174, 99842, 'KHG-02', 'Paket 2 Botol (120 Kapsul - Hemat)', 145000, 230000, 200, 403),
  (20175, 99842, 'KHG-03', 'Paket 3 Botol (Persediaan Keluarga)', 199000, 345000, 300, 403);
--> statement-breakpoint
INSERT OR IGNORE INTO products
  (id, store_id, title, slug, category, is_active, created_at, image_url, brand, description)
VALUES
  (99827, 1, 'Kapsul Buah Pinang Muda Herbal Alami (Isi 25 Kapsul)', 'kapsul-pinang-muda', 'Herbal & Vitalitas', 1, '2026-10-13 17:38:22', '/images/landing/kapsul-pinang-muda/hero-product.webp', 'PG Store Herbal', 'Suplemen herbal ekstrak buah pinang muda pilihan (isi 25 kapsul) untuk membantu memelihara stamina, kebugaran fisik, dan daya tahan tubuh harian pria dewasa secara praktis tanpa rasa sepat.');
--> statement-breakpoint
INSERT OR IGNORE INTO product_variants
  (id, product_id, sku, title, price, compare_price, weight_grams, stock)
VALUES
  (20128, 99827, 'KPM-01', 'Beli 1 Botol (Isi 25 Kapsul)', 99000, 139000, 150, 1555),
  (20129, 99827, 'KPM-02', 'Paket 2 Botol (Stamina Rutin - Hemat)', 179000, 278000, 300, 1555),
  (20130, 99827, 'KPM-03', 'Paket 3 Botol (Persediaan Lengkap)', 249000, 417000, 450, 1555);
--> statement-breakpoint
INSERT OR IGNORE INTO products
  (id, store_id, title, slug, category, is_active, created_at, image_url, brand, description)
VALUES
  (99843, 1, 'KARCLEAN Cairan Pembersih Kerak Kamar Mandi, Keramik & Kloset', 'karclean-pembersih-kerak', 'Kebutuhan Rumah Tangga', 1, '2026-10-13 17:38:22', '/images/landing/karclean-pembersih-kerak/hero-product.webp', 'Karclean', 'Cairan pembersih kerak air membandel, noda kuning kloset, wastafel, dan lantai keramik kamar mandi. Cukup kuas pada permukaan berkerak untuk mengembalikan kebersihan kamar mandi.');
--> statement-breakpoint
INSERT OR IGNORE INTO product_variants
  (id, product_id, sku, title, price, compare_price, weight_grams, stock)
VALUES
  (20176, 99843, 'KPK-01', 'Beli 1 Botol Karclean', 69000, 99000, 300, 5000),
  (20177, 99843, 'KPK-02', 'Paket 2 Botol (Hemat Kamar Mandi)', 125000, 198000, 600, 5000),
  (20178, 99843, 'KPK-03', 'Paket 3 Botol (Bersih Total 1 Rumah)', 169000, 297000, 900, 5000);
--> statement-breakpoint
INSERT OR IGNORE INTO products
  (id, store_id, title, slug, category, is_active, created_at, image_url, brand, description)
VALUES
  (99830, 1, 'LAO LI SHI Collagen Wire Drawing Cream 50g — Krim Kolagen Pelembap Wajah', 'lao-li-shi-collagen', 'Kecantikan & Perawatan Wajah', 1, '2026-10-13 17:38:22', '/images/landing/lao-li-shi-collagen/hero-product.webp', 'Cherbal', 'Krim pelembap wajah bertekstur serat kolagen elastis (Wire Drawing Cream 50g). Membantu menjaga kelembapan kulit kering, merawat kekenyalan dan elastisitas kulit wajah agar tampak segar bercahaya.');
--> statement-breakpoint
INSERT OR IGNORE INTO product_variants
  (id, product_id, sku, title, price, compare_price, weight_grams, stock)
VALUES
  (20137, 99830, 'LLS-01', 'Beli 1 Pot (Isi 50g)', 88000, 129000, 100, 657),
  (20138, 99830, 'LLS-02', 'Paket 2 Pot (Perawatan Siang & Malam)', 149000, 258000, 200, 657),
  (20139, 99830, 'LLS-03', 'Paket 3 Pot (Super Hemat)', 199000, 387000, 300, 657);
--> statement-breakpoint
INSERT OR IGNORE INTO products
  (id, store_id, title, slug, category, is_active, created_at, image_url, brand, description)
VALUES
  (99831, 1, 'Zhi Fang Liu Cream 30g — Krim Herbal Perawatan Area Kulit', 'lipoma-cream-herbal', 'Perawatan Tubuh Herbal', 1, '2026-10-13 17:38:22', '/images/landing/lipoma-cream-herbal/hero-product.webp', 'Cherbal', 'Krim oles luar berbahan ekstrak herbal tradisional 30 gram untuk perawatan topikal area kulit tubuh. Tekstur lembut mudah meresap, nyaman di kulit, dan praktis digunakan di rumah.');
--> statement-breakpoint
INSERT OR IGNORE INTO product_variants
  (id, product_id, sku, title, price, compare_price, weight_grams, stock)
VALUES
  (20140, 99831, 'LCH-01', 'Beli 1 Tube (Isi 30g)', 89000, 129000, 50, 450),
  (20141, 99831, 'LCH-02', 'Paket 2 Tube (Perawatan Rutin)', 159000, 258000, 100, 450),
  (20142, 99831, 'LCH-03', 'Paket 3 Tube (Paket Lengkap)', 219000, 387000, 150, 450);
--> statement-breakpoint
INSERT OR IGNORE INTO products
  (id, store_id, title, slug, category, is_active, created_at, image_url, brand, description)
VALUES
  (99838, 1, 'Omega Brain High DHA Fish Oil (Isi 60 Softgel) — Suplemen Nutrisi Fokus', 'omega-brain-dha', 'Suplemen Kesehatan', 1, '2026-10-13 17:38:22', '/images/landing/omega-brain-dha/hero-product.webp', 'Cherbal', 'Suplemen minyak ikan tinggi DHA & EPA (Omega-3) isi 60 kapsul lunak untuk membantu memenuhi nutrisi harian otak, menjaga daya ingat, konsentrasi belajar, dan kesehatan tubuh.');
--> statement-breakpoint
INSERT OR IGNORE INTO product_variants
  (id, product_id, sku, title, price, compare_price, weight_grams, stock)
VALUES
  (20161, 99838, 'OBD-01', 'Beli 1 Botol (Isi 60 Softgel)', 129000, 179000, 100, 253),
  (20162, 99838, 'OBD-02', 'Paket 2 Botol (Isi 120 Softgel - Hemat)', 229000, 358000, 200, 253),
  (20163, 99838, 'OBD-03', 'Paket 3 Botol (Isi 180 Softgel)', 319000, 537000, 300, 253);
--> statement-breakpoint
INSERT OR IGNORE INTO products
  (id, store_id, title, slug, category, is_active, created_at, image_url, brand, description)
VALUES
  (99833, 1, 'GlowHome Semprotan Pembersih Interior Mobil & Jok 450ml', 'pembersih-interior-mobil', 'Otomotif & Perawatan Mobil', 1, '2026-10-13 17:38:22', '/images/landing/pembersih-interior-mobil/hero-product.webp', 'GlowHome', 'Cairan semprot pembersih kabin interior mobil 450ml. Praktis mengangkat noda kusam pada jok kulit/fabric, plafon, dashboard, dan door trim tanpa perlu dibilas air.');
--> statement-breakpoint
INSERT OR IGNORE INTO product_variants
  (id, product_id, sku, title, price, compare_price, weight_grams, stock)
VALUES
  (20146, 99833, 'PIM-01', 'Beli 1 Botol (450ml)', 79000, 115000, 300, 469),
  (20147, 99833, 'PIM-02', 'Paket 2 Botol (900ml - Hemat)', 139000, 230000, 600, 469),
  (20148, 99833, 'PIM-03', 'Paket 3 Botol (Perawatan Full Kabin)', 189000, 345000, 900, 469);
--> statement-breakpoint
INSERT OR IGNORE INTO products
  (id, store_id, title, slug, category, is_active, created_at, image_url, brand, description)
VALUES
  (99837, 1, 'GlowHome Semprotan Pembersih Kulkas & Dapur 450ml', 'pembersih-kulkas-glowhome', 'Kebutuhan Rumah Tangga', 1, '2026-10-13 17:38:22', '/images/landing/pembersih-kulkas-glowhome/hero-product.webp', 'GlowHome', 'Cairan semprot pembersih kulkas, microwave, dan permukaan dapur 450ml. Mengangkat tumpahan makanan, noda minyak, dan bau amis membandel dengan praktis tanpa perlu dibilas rumit.');
--> statement-breakpoint
INSERT OR IGNORE INTO product_variants
  (id, product_id, sku, title, price, compare_price, weight_grams, stock)
VALUES
  (20158, 99837, 'PKG-01', 'Beli 1 Botol (450ml)', 75000, 110000, 300, 901),
  (20159, 99837, 'PKG-02', 'Paket 2 Botol (900ml - Hemat)', 135000, 220000, 600, 901),
  (20160, 99837, 'PKG-03', 'Paket 3 Botol (Stok Dapur Bersih)', 185000, 330000, 900, 901);
--> statement-breakpoint
INSERT OR IGNORE INTO products
  (id, store_id, title, slug, category, is_active, created_at, image_url, brand, description)
VALUES
  (99829, 1, 'Pupuk Pelebat Tanaman Buah & Perangsang Bunga 250gr', 'pupuk-pelebat-buah', 'Agrikultur & Perkebunan', 1, '2026-10-13 17:38:22', '/images/landing/pupuk-pelebat-buah/hero-product.webp', 'PG Store Agro', 'Nutrisi pupuk pembungaan dan pembuahan tanaman buah 250 gram. Membantu merangsang tumbuhnya bakal bunga, memperkuat tangkai buah agar tidak mudah rontok, dan menutrisi tanaman buah di pot maupun kebun.');
--> statement-breakpoint
INSERT OR IGNORE INTO product_variants
  (id, product_id, sku, title, price, compare_price, weight_grams, stock)
VALUES
  (20134, 99829, 'PPB-01', 'Beli 1 Pouch (250 Gram)', 69000, 99000, 250, 2619),
  (20135, 99829, 'PPB-02', 'Paket 2 Pouch (500 Gram - Hemat)', 125000, 198000, 500, 2619),
  (20136, 99829, 'PPB-03', 'Paket 3 Pouch (750 Gram - Kebun)', 169000, 297000, 750, 2619);
--> statement-breakpoint
UPDATE products
SET
  title = 'Rendaman Kaki Tabib',
  category = 'Umum',
  brand = 'Rendaman Kaki Tabib',
  image_url = '/images/landing/rendaman-kaki-tabib/hero-product.webp',
  description = 'Bundling Get 3 Kaki Tabib (15g) adalah ramuan rempah rendaman kaki aromaterapi untuk membantu merilekskan telapak kaki pegal, menjaga kebersihan kulit kaki, dan mengurangi bau kaki setelah beraktivitas.'
WHERE id = 90012;
--> statement-breakpoint
INSERT OR IGNORE INTO products
  (id, store_id, title, slug, category, is_active, created_at, image_url, brand, description)
VALUES
  (99836, 1, 'Warzn Soothing Eye Spray 10ml — Semprotan Penyegar Area Mata Lelah', 'semprotan-mata-herbal', 'Kesehatan & Perawatan Diri', 1, '2026-10-13 17:38:22', '/images/landing/semprotan-mata-herbal/hero-product.webp', 'Cherbal', 'Semprotan kabut mikro (mist spray) 10ml yang praktis untuk membantu menyegarkan dan melembapkan area sekitar mata yang lelah akibat layar HP, komputer, atau debu perjalanan.');
--> statement-breakpoint
INSERT OR IGNORE INTO product_variants
  (id, product_id, sku, title, price, compare_price, weight_grams, stock)
VALUES
  (20155, 99836, 'SMH-01', 'Beli 1 Botol (10ml)', 88000, 125000, 50, 639),
  (20156, 99836, 'SMH-02', 'Paket 2 Botol (Hemat Rumah & Kantor)', 159000, 250000, 100, 639),
  (20157, 99836, 'SMH-03', 'Paket 3 Botol (Keluarga)', 219000, 375000, 150, 639);
--> statement-breakpoint
INSERT OR IGNORE INTO products
  (id, store_id, title, slug, category, is_active, created_at, image_url, brand, description)
VALUES
  (99835, 1, 'So Easy Pembersih Tabung Mesin Cuci (Isi 2 Pack)', 'so-easy-pembersih-mesin-cuci', 'Kebutuhan Rumah Tangga', 1, '2026-10-13 17:38:22', '/images/landing/so-easy-pembersih-mesin-cuci/hero-product.webp', 'So Easy', 'Serbuk aktif pembersih tabung mesin cuci bukaan depan maupun atas (1 set isi 2 pack). Membantu meluruhkan kerak residu deterjen, lumut tersembunyi, dan bau apek tanpa perlu membongkar mesin cuci.');
--> statement-breakpoint
INSERT OR IGNORE INTO product_variants
  (id, product_id, sku, title, price, compare_price, weight_grams, stock)
VALUES
  (20152, 99835, 'SEW-01', '1 Set (Isi 2 Pack Pembersih)', 69000, 99000, 200, 1880),
  (20153, 99835, 'SEW-02', '2 Set (Isi 4 Pack - Hemat Rutin)', 119000, 198000, 400, 1880),
  (20154, 99835, 'SEW-03', '3 Set (Isi 6 Pack - Stok Tahunan)', 159000, 297000, 600, 1880);
--> statement-breakpoint
INSERT OR IGNORE INTO products
  (id, store_id, title, slug, category, is_active, created_at, image_url, brand, description)
VALUES
  (99826, 1, 'Kapsul Herbal Syaraf Kejepit 500mg (Isi 50 Kapsul)', 'syaraf-kejepit-herbal', 'Herbal & Kesehatan Sendi', 1, '2026-10-13 17:38:22', '/images/landing/syaraf-kejepit-herbal/hero-product.webp', 'PG Store Herbal', 'Suplemen kapsul herbal alami 500mg (isi 50 kapsul) dari ekstrak tanaman herbal pilihan untuk membantu menjaga kenyamanan saraf, persendian, pinggang, dan kebugaran gerak harian. Tersertifikasi Halal dan bisa COD.');
--> statement-breakpoint
INSERT OR IGNORE INTO product_variants
  (id, product_id, sku, title, price, compare_price, weight_grams, stock)
VALUES
  (20125, 99826, 'SKH-01', 'Beli 1 Botol (Isi 50 Kapsul)', 99000, 139000, 100, 1880),
  (20126, 99826, 'SKH-02', 'Paket 2 Botol (Terapi Rutin - Hemat)', 179000, 278000, 200, 1880),
  (20127, 99826, 'SKH-03', 'Paket 3 Botol (Perawatan Lengkap)', 249000, 417000, 300, 1880);
--> statement-breakpoint
INSERT OR IGNORE INTO products
  (id, store_id, title, slug, category, is_active, created_at, image_url, brand, description)
VALUES
  (99840, 1, '[Theravol] Natural Oil — Minyak Urut Herbal Pria BPOM NA18260103165', 'theravol-natural-oil', 'Herbal & Vitalitas Pria', 1, '2026-10-13 17:38:22', '/images/landing/theravol-natural-oil/hero-product.webp', 'Theravol', 'Minyak urut perawatan pria berbahan herbal alami yang telah terdaftar resmi di BPOM RI (NA18260103165). Membantu merawat sirkulasi darah area vital pria dengan privasi pengiriman rapat.');
--> statement-breakpoint
INSERT OR IGNORE INTO product_variants
  (id, product_id, sku, title, price, compare_price, weight_grams, stock)
VALUES
  (20167, 99840, 'TNO-01', 'Beli 1 Botol (Original BPOM)', 85000, 125000, 100, 955),
  (20168, 99840, 'TNO-02', 'Paket 2 Botol (Hemat Sepasang)', 149000, 250000, 200, 955),
  (20169, 99840, 'TNO-03', 'Paket 3 Botol (Perawatan Maksimal)', 199000, 375000, 300, 955);
--> statement-breakpoint
INSERT OR IGNORE INTO products
  (id, store_id, title, slug, category, is_active, created_at, image_url, brand, description)
VALUES
  (99844, 1, '[Theravol] Tiga Jari Oil — Minyak Oles Herbal Pria 30ml BPOM', 'tiga-jari-oil', 'Herbal & Vitalitas Pria', 1, '2026-10-13 17:38:22', '/images/landing/tiga-jari-oil/hero-product.webp', 'Theravol', 'Minyak oles herbal perawatan pria 30ml terdaftar resmi BPOM RI (NA18240118218). Membantu memelihara sirkulasi dan vitalitas pria dengan kemasan privasi rapat.');
--> statement-breakpoint
INSERT OR IGNORE INTO product_variants
  (id, product_id, sku, title, price, compare_price, weight_grams, stock)
VALUES
  (20179, 99844, 'TJO-01', 'Beli 1 Botol (30ml BPOM)', 95000, 139000, 100, 9997),
  (20180, 99844, 'TJO-02', 'Paket 2 Botol (Hemat Sepasang)', 169000, 278000, 200, 9997),
  (20181, 99844, 'TJO-03', 'Paket 3 Botol (Super Hemat)', 229000, 417000, 300, 9997);
--> statement-breakpoint
INSERT INTO landing_pages
  (id, slug, title, product_id, is_active, is_product_page, meta_title, meta_description, source, created_at, updated_at)
VALUES
  ('native:asam-humat-premium', 'asam-humat-premium', 'Asam Humat Premium 500gr — Pembenah Tanah Organik & Penyubur Akar', '99841', 1, 1, 'Asam Humat Premium 500gr — Pembenah Tanah Organik & Penyubur Akar', 'Landing page direct-response untuk Asam Humat Premium 500gr pembenah struktur tanah keras dan penguat perakaran tanaman.', 'native', '2026-10-13 17:38:22', '2026-10-13T18:07:37.585Z')
ON CONFLICT(id) DO UPDATE SET
  slug = excluded.slug,
  title = excluded.title,
  product_id = excluded.product_id,
  is_active = excluded.is_active,
  is_product_page = excluded.is_product_page,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO landing_pages
  (id, slug, title, product_id, is_active, is_product_page, meta_title, meta_description, source, created_at, updated_at)
VALUES
  ('native:deterjen-pakaian-dalam-300ml', 'deterjen-pakaian-dalam-300ml', 'GlowHome Lingerie Wash 300ml — Pembersih Noda Pakaian Dalam Wanita', '65015', 1, 1, 'GlowHome Lingerie Wash 300ml — Pembersih Noda Pakaian Dalam Wanita', 'Landing page direct-response untuk GlowHome Lingerie Wash 300ml deterjen enzim khusus pengangkat noda darah haid & kekuningan.', 'native', '2026-10-13 17:38:22', '2026-10-13T18:07:37.585Z')
ON CONFLICT(id) DO UPDATE SET
  slug = excluded.slug,
  title = excluded.title,
  product_id = excluded.product_id,
  is_active = excluded.is_active,
  is_product_page = excluded.is_product_page,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO landing_pages
  (id, slug, title, product_id, is_active, is_product_page, meta_title, meta_description, source, created_at, updated_at)
VALUES
  ('native:dragon-blood-cream', 'dragon-blood-cream', 'Bundling Dragon Blood Cream 50g (Beli 1 Gratis 1 — Dapat 2 Pot)', '99834', 1, 1, 'Bundling Dragon Blood Cream 50g (Beli 1 Gratis 1 — Dapat 2 Pot)', 'Landing page direct-response untuk paket bundling hemat Dragon Blood Cream 50g Beli 1 Gratis 1 pelembap & pencerah wajah.', 'native', '2026-10-13 17:38:22', '2026-10-13T18:07:37.585Z')
ON CONFLICT(id) DO UPDATE SET
  slug = excluded.slug,
  title = excluded.title,
  product_id = excluded.product_id,
  is_active = excluded.is_active,
  is_product_page = excluded.is_product_page,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO landing_pages
  (id, slug, title, product_id, is_active, is_product_page, meta_title, meta_description, source, created_at, updated_at)
VALUES
  ('native:fertani-herbisida', 'fertani-herbisida', 'Fertani Herbisida Pembasmi Rumput Liar 250gr Sampai Akar', '71823', 1, 1, 'Fertani Herbisida Pembasmi Rumput Liar 250gr Sampai Akar', 'Landing page direct-response untuk Fertani Herbisida 250gr pembasmi rumput liar dan gulma membandel hingga ke akar.', 'native', '2026-10-13 17:38:22', '2026-10-13T18:07:37.585Z')
ON CONFLICT(id) DO UPDATE SET
  slug = excluded.slug,
  title = excluded.title,
  product_id = excluded.product_id,
  is_active = excluded.is_active,
  is_product_page = excluded.is_product_page,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO landing_pages
  (id, slug, title, product_id, is_active, is_product_page, meta_title, meta_description, source, created_at, updated_at)
VALUES
  ('native:fertani-penggemuk-ikan', 'fertani-penggemuk-ikan', 'Fertani Suplemen Penggemuk Ikan Air Tawar 250gr — Campuran Pakan Pelet', '99839', 1, 1, 'Fertani Suplemen Penggemuk Ikan Air Tawar 250gr — Campuran Pakan Pelet', 'Landing page direct-response untuk Fertani Suplemen Penggemuk Ikan Air Tawar 250gr premix peningkat nafsu makan ikan budidaya.', 'native', '2026-10-13 17:38:22', '2026-10-13T18:07:37.585Z')
ON CONFLICT(id) DO UPDATE SET
  slug = excluded.slug,
  title = excluded.title,
  product_id = excluded.product_id,
  is_active = excluded.is_active,
  is_product_page = excluded.is_product_page,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO landing_pages
  (id, slug, title, product_id, is_active, is_product_page, meta_title, meta_description, source, created_at, updated_at)
VALUES
  ('native:ginseng-cordyceps', 'ginseng-cordyceps', 'Tablet Ginseng Cordyceps Sinensis Ochiban 500mg — Suplemen Stamina', '99832', 1, 1, 'Tablet Ginseng Cordyceps Sinensis Ochiban 500mg — Suplemen Stamina', 'Landing page direct-response untuk Tablet Ginseng Cordyceps Sinensis Ochiban 500mg suplemen stamina dan daya tahan tubuh.', 'native', '2026-10-13 17:38:22', '2026-10-13T18:07:37.585Z')
ON CONFLICT(id) DO UPDATE SET
  slug = excluded.slug,
  title = excluded.title,
  product_id = excluded.product_id,
  is_active = excluded.is_active,
  is_product_page = excluded.is_product_page,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO landing_pages
  (id, slug, title, product_id, is_active, is_product_page, meta_title, meta_description, source, created_at, updated_at)
VALUES
  ('native:kapsul-herbal-brotowali', 'kapsul-herbal-brotowali', 'Kapsul Herbal Brotowali Alami (Isi 50 Kapsul)', '99828', 1, 1, 'Kapsul Herbal Brotowali Alami (Isi 50 Kapsul)', 'Landing page direct-response untuk Kapsul Herbal Brotowali 50 Kapsul penjaga daya tahan tubuh & kebugaran tanpa rasa pahit.', 'native', '2026-10-13 17:38:22', '2026-10-13T18:07:37.585Z')
ON CONFLICT(id) DO UPDATE SET
  slug = excluded.slug,
  title = excluded.title,
  product_id = excluded.product_id,
  is_active = excluded.is_active,
  is_product_page = excluded.is_product_page,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO landing_pages
  (id, slug, title, product_id, is_active, is_product_page, meta_title, meta_description, source, created_at, updated_at)
VALUES
  ('native:kapsul-herbal-gurah', 'kapsul-herbal-gurah', 'Kapsul Herbal Gurah 60 Kapsul — Perawatan Tenggorokan & Pernapasan BPOM', '99842', 1, 1, 'Kapsul Herbal Gurah 60 Kapsul — Perawatan Tenggorokan & Pernapasan BPOM', 'Landing page direct-response untuk Kapsul Herbal Gurah 60 Kapsul resmi BPOM TR213305391 pereda batuk berdahak & pelega tenggorokan.', 'native', '2026-10-13 17:38:22', '2026-10-13T18:07:37.585Z')
ON CONFLICT(id) DO UPDATE SET
  slug = excluded.slug,
  title = excluded.title,
  product_id = excluded.product_id,
  is_active = excluded.is_active,
  is_product_page = excluded.is_product_page,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO landing_pages
  (id, slug, title, product_id, is_active, is_product_page, meta_title, meta_description, source, created_at, updated_at)
VALUES
  ('native:kapsul-pinang-muda', 'kapsul-pinang-muda', 'Kapsul Buah Pinang Muda Herbal Alami (Isi 25 Kapsul)', '99827', 1, 1, 'Kapsul Buah Pinang Muda Herbal Alami (Isi 25 Kapsul)', 'Landing page direct-response untuk suplemen Kapsul Buah Pinang Muda penjaga stamina, vitalitas, dan daya tahan tubuh pria.', 'native', '2026-10-13 17:38:22', '2026-10-13T18:07:37.585Z')
ON CONFLICT(id) DO UPDATE SET
  slug = excluded.slug,
  title = excluded.title,
  product_id = excluded.product_id,
  is_active = excluded.is_active,
  is_product_page = excluded.is_product_page,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO landing_pages
  (id, slug, title, product_id, is_active, is_product_page, meta_title, meta_description, source, created_at, updated_at)
VALUES
  ('native:karclean-pembersih-kerak', 'karclean-pembersih-kerak', 'KARCLEAN Cairan Pembersih Kerak Kamar Mandi, Keramik & Kloset', '99843', 1, 1, 'KARCLEAN Cairan Pembersih Kerak Kamar Mandi, Keramik & Kloset', 'Landing page direct-response untuk KARCLEAN Cairan Pembersih Kerak Kamar Mandi pengangkat kerak air, noda kuning kloset & wastafel.', 'native', '2026-10-13 17:38:22', '2026-10-13T18:07:37.585Z')
ON CONFLICT(id) DO UPDATE SET
  slug = excluded.slug,
  title = excluded.title,
  product_id = excluded.product_id,
  is_active = excluded.is_active,
  is_product_page = excluded.is_product_page,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO landing_pages
  (id, slug, title, product_id, is_active, is_product_page, meta_title, meta_description, source, created_at, updated_at)
VALUES
  ('native:lao-li-shi-collagen', 'lao-li-shi-collagen', 'LAO LI SHI Collagen Wire Drawing Cream 50g — Krim Kolagen Wajah', '99830', 1, 1, 'LAO LI SHI Collagen Wire Drawing Cream 50g — Krim Kolagen Wajah', 'Landing page direct-response untuk LAO LI SHI Collagen Wire Drawing Cream 50g pelembap & perawatan elastisitas kulit wajah.', 'native', '2026-10-13 17:38:22', '2026-10-13T18:07:37.585Z')
ON CONFLICT(id) DO UPDATE SET
  slug = excluded.slug,
  title = excluded.title,
  product_id = excluded.product_id,
  is_active = excluded.is_active,
  is_product_page = excluded.is_product_page,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO landing_pages
  (id, slug, title, product_id, is_active, is_product_page, meta_title, meta_description, source, created_at, updated_at)
VALUES
  ('native:lipoma-cream-herbal', 'lipoma-cream-herbal', 'Zhi Fang Liu Cream 30g — Krim Herbal Perawatan Area Kulit', '99831', 1, 1, 'Zhi Fang Liu Cream 30g — Krim Herbal Perawatan Area Kulit', 'Landing page direct-response untuk Zhi Fang Liu Herbal Cream 30g krim oles perawatan luar area kulit tubuh.', 'native', '2026-10-13 17:38:22', '2026-10-13T18:07:37.585Z')
ON CONFLICT(id) DO UPDATE SET
  slug = excluded.slug,
  title = excluded.title,
  product_id = excluded.product_id,
  is_active = excluded.is_active,
  is_product_page = excluded.is_product_page,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO landing_pages
  (id, slug, title, product_id, is_active, is_product_page, meta_title, meta_description, source, created_at, updated_at)
VALUES
  ('native:omega-brain-dha', 'omega-brain-dha', 'Omega Brain High DHA Fish Oil (Isi 60 Softgel) — Suplemen Nutrisi Fokus', '99838', 1, 1, 'Omega Brain High DHA Fish Oil (Isi 60 Softgel) — Suplemen Nutrisi Fokus', 'Landing page direct-response untuk Omega Brain High DHA Fish Oil 60 Softgel suplemen minyak ikan Omega-3 nutrisi fokus & memori.', 'native', '2026-10-13 17:38:22', '2026-10-13T18:07:37.585Z')
ON CONFLICT(id) DO UPDATE SET
  slug = excluded.slug,
  title = excluded.title,
  product_id = excluded.product_id,
  is_active = excluded.is_active,
  is_product_page = excluded.is_product_page,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO landing_pages
  (id, slug, title, product_id, is_active, is_product_page, meta_title, meta_description, source, created_at, updated_at)
VALUES
  ('native:pembersih-interior-mobil', 'pembersih-interior-mobil', 'GlowHome Semprotan Pembersih Interior Mobil & Jok 450ml', '99833', 1, 1, 'GlowHome Semprotan Pembersih Interior Mobil & Jok 450ml', 'Landing page direct-response untuk GlowHome Semprotan Pembersih Interior Mobil 450ml pembersih jok, plafon & dashboard tanpa bilas.', 'native', '2026-10-13 17:38:22', '2026-10-13T18:07:37.585Z')
ON CONFLICT(id) DO UPDATE SET
  slug = excluded.slug,
  title = excluded.title,
  product_id = excluded.product_id,
  is_active = excluded.is_active,
  is_product_page = excluded.is_product_page,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO landing_pages
  (id, slug, title, product_id, is_active, is_product_page, meta_title, meta_description, source, created_at, updated_at)
VALUES
  ('native:pembersih-kulkas-glowhome', 'pembersih-kulkas-glowhome', 'GlowHome Semprotan Pembersih Kulkas & Dapur 450ml', '99837', 1, 1, 'GlowHome Semprotan Pembersih Kulkas & Dapur 450ml', 'Landing page direct-response untuk GlowHome Semprotan Pembersih Kulkas 450ml pengangkat noda makanan & bau amis tanpa bilas.', 'native', '2026-10-13 17:38:22', '2026-10-13T18:07:37.585Z')
ON CONFLICT(id) DO UPDATE SET
  slug = excluded.slug,
  title = excluded.title,
  product_id = excluded.product_id,
  is_active = excluded.is_active,
  is_product_page = excluded.is_product_page,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO landing_pages
  (id, slug, title, product_id, is_active, is_product_page, meta_title, meta_description, source, created_at, updated_at)
VALUES
  ('native:pupuk-pelebat-buah', 'pupuk-pelebat-buah', 'Pupuk Pelebat Tanaman Buah & Perangsang Bunga 250gr', '99829', 1, 1, 'Pupuk Pelebat Tanaman Buah & Perangsang Bunga 250gr', 'Landing page direct-response untuk Pupuk Pelebat Tanaman Buah 250gr nutrisi pembungaan dan anti rontok tanaman buah.', 'native', '2026-10-13 17:38:22', '2026-10-13T18:07:37.585Z')
ON CONFLICT(id) DO UPDATE SET
  slug = excluded.slug,
  title = excluded.title,
  product_id = excluded.product_id,
  is_active = excluded.is_active,
  is_product_page = excluded.is_product_page,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO landing_pages
  (id, slug, title, product_id, is_active, is_product_page, meta_title, meta_description, source, created_at, updated_at)
VALUES
  ('native:rendaman-kaki-tabib', 'rendaman-kaki-tabib', 'Bundling Get 3 Kaki Tabib — Rempah Rendaman Kaki Pegal & Relaksasi', '90012', 1, 1, 'Bundling Get 3 Kaki Tabib — Rempah Rendaman Kaki Pegal & Relaksasi', 'Landing page direct-response untuk Bundling Get 3 Kaki Tabib (15g) ramuan rempah rendaman kaki hangat untuk relaksasi & bau kaki.', 'native', '2026-10-13 17:38:22', '2026-10-13T18:07:37.585Z')
ON CONFLICT(id) DO UPDATE SET
  slug = excluded.slug,
  title = excluded.title,
  product_id = excluded.product_id,
  is_active = excluded.is_active,
  is_product_page = excluded.is_product_page,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO landing_pages
  (id, slug, title, product_id, is_active, is_product_page, meta_title, meta_description, source, created_at, updated_at)
VALUES
  ('native:semprotan-mata-herbal', 'semprotan-mata-herbal', 'Warzn Soothing Eye Spray 10ml — Semprotan Penyegar Area Mata Lelah', '99836', 1, 1, 'Warzn Soothing Eye Spray 10ml — Semprotan Penyegar Area Mata Lelah', 'Landing page direct-response untuk Warzn Soothing Eye Spray 10ml semprotan kabut halus penyegar area mata lelah.', 'native', '2026-10-13 17:38:22', '2026-10-13T18:07:37.585Z')
ON CONFLICT(id) DO UPDATE SET
  slug = excluded.slug,
  title = excluded.title,
  product_id = excluded.product_id,
  is_active = excluded.is_active,
  is_product_page = excluded.is_product_page,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO landing_pages
  (id, slug, title, product_id, is_active, is_product_page, meta_title, meta_description, source, created_at, updated_at)
VALUES
  ('native:so-easy-pembersih-mesin-cuci', 'so-easy-pembersih-mesin-cuci', 'So Easy Pembersih Tabung Mesin Cuci (Isi 2 Pack)', '99835', 1, 1, 'So Easy Pembersih Tabung Mesin Cuci (Isi 2 Pack)', 'Landing page direct-response untuk So Easy Pembersih Tabung Mesin Cuci 2PCS peluruh kerak, lumut & bau apek tabung mesin cuci.', 'native', '2026-10-13 17:38:22', '2026-10-13T18:07:37.585Z')
ON CONFLICT(id) DO UPDATE SET
  slug = excluded.slug,
  title = excluded.title,
  product_id = excluded.product_id,
  is_active = excluded.is_active,
  is_product_page = excluded.is_product_page,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO landing_pages
  (id, slug, title, product_id, is_active, is_product_page, meta_title, meta_description, source, created_at, updated_at)
VALUES
  ('native:syaraf-kejepit-herbal', 'syaraf-kejepit-herbal', 'Kapsul Herbal Syaraf Kejepit 500mg (Isi 50 Kapsul)', '99826', 1, 1, 'Kapsul Herbal Syaraf Kejepit 500mg (Isi 50 Kapsul)', 'Landing page direct-response untuk suplemen Kapsul Herbal Syaraf Kejepit 500mg perawatan saraf, pinggang, dan persendian.', 'native', '2026-10-13 17:38:22', '2026-10-13T18:07:37.585Z')
ON CONFLICT(id) DO UPDATE SET
  slug = excluded.slug,
  title = excluded.title,
  product_id = excluded.product_id,
  is_active = excluded.is_active,
  is_product_page = excluded.is_product_page,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO landing_pages
  (id, slug, title, product_id, is_active, is_product_page, meta_title, meta_description, source, created_at, updated_at)
VALUES
  ('native:theravol-natural-oil', 'theravol-natural-oil', '[Theravol] Natural Oil — Minyak Urut Herbal Pria BPOM NA18260103165', '99840', 1, 1, '[Theravol] Natural Oil — Minyak Urut Herbal Pria BPOM NA18260103165', 'Landing page direct-response untuk Theravol Natural Oil Minyak Urut Herbal Pria terdaftar resmi BPOM NA18260103165.', 'native', '2026-10-13 17:38:22', '2026-10-13T18:07:37.585Z')
ON CONFLICT(id) DO UPDATE SET
  slug = excluded.slug,
  title = excluded.title,
  product_id = excluded.product_id,
  is_active = excluded.is_active,
  is_product_page = excluded.is_product_page,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  updated_at = excluded.updated_at;
--> statement-breakpoint
INSERT INTO landing_pages
  (id, slug, title, product_id, is_active, is_product_page, meta_title, meta_description, source, created_at, updated_at)
VALUES
  ('native:tiga-jari-oil', 'tiga-jari-oil', '[Theravol] Tiga Jari Oil — Minyak Oles Herbal Pria 30ml BPOM', '99844', 1, 1, '[Theravol] Tiga Jari Oil — Minyak Oles Herbal Pria 30ml BPOM', 'Landing page direct-response untuk Theravol Tiga Jari Oil 30ml Minyak Oles Herbal Pria terdaftar resmi BPOM NA18240118218.', 'native', '2026-10-13 17:38:22', '2026-10-13T18:07:37.585Z')
ON CONFLICT(id) DO UPDATE SET
  slug = excluded.slug,
  title = excluded.title,
  product_id = excluded.product_id,
  is_active = excluded.is_active,
  is_product_page = excluded.is_product_page,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  updated_at = excluded.updated_at;
