/**
 * The register of native Astro landing pages.
 *
 * A native landing page is a real route file — `src/pages/<slug>.astro` — built
 * and deployed with the Worker. Adding an entry here is what makes the CMS
 * aware of it: the admin can see it, copy its link, and hand it a product page.
 * Without an entry the route still answers on its URL, but the operator has no
 * way to know it exists.
 *
 * **This is a manifest, not discovery.** Cloudflare Workers bundles routes and
 * cannot enumerate `src/pages/` at runtime, so the list is written down and
 * compiled in. `validateNativeLandingPages` fails the build on a duplicate or
 * an incomplete entry rather than shipping a register that misrepresents the
 * site.
 *
 * To add one:
 *   1. create `src/pages/<slug>.astro` (see `docs/LANDING-PAGES.md`);
 *   2. add its entry below, with `slug` matching the filename exactly;
 *   3. deploy. The CMS picks it up on the next landing-page list load, or
 *      within the hour from the scheduled re-sync — the sitemap with it.
 *
 * To remove one: delete both. Removing only the file leaves a register entry
 * pointing at a 404; removing only the entry leaves an unlisted live URL.
 */
export type NativeLandingPage = {
  /** Must equal the route filename, and is the public path: `/<slug>`. */
  slug: string;
  /** Shown in the CMS list. */
  title: string;
  /** The product this page sells, by product slug. */
  productSlug: string;
  /** Shown in the CMS list beneath the title. */
  description: string;
  /** Optional list thumbnail (root-relative or https). Without it the lists
   *  show the product's photo. */
  image?: string;
  /** A page can be registered before it is ready to be linked. */
  isActive?: boolean;
};

export const nativeLandingPages: NativeLandingPage[] = [
  {
    slug: 'tas-selempang-wanita-modern',
    title: 'Tas Selempang Wanita Modern (Chic Korean Style)',
    productSlug: 'tas-selempang-wanita-modern',
    description: 'Landing page konversi untuk campaign Tas Selempang Wanita Modern kulit PU premium.',
    isActive: true,
  },
  {
    slug: 'senter-led-mini',
    title: 'Lampu Senter LED Mini Multifungsi (Headlamp Sensor Gerak)',
    productSlug: 'lampu-led-mini',
    description: 'Landing page konversi untuk Lampu Senter LED Mini & Headlamp Sensor Gerak.',
    isActive: true,
  },
  {
    slug: 'lampu-dinding-solar',
    title: 'Lampu Dinding Solar Tenaga Surya (Sensor Gerak & Tahan Air IP65)',
    productSlug: 'lampu-dinding-solar',
    description: 'Landing page konversi untuk Lampu Dinding Solar Outdoor Pagar & Halaman Rumah.',
    isActive: true,
  },
  {
    slug: 'holder-hp',
    title: 'Holder HP Spion Motor Besi Tangguh (Kokoh Anti Getar & Stabil)',
    productSlug: 'holder-hp',
    description: 'Landing page konversi untuk Holder HP Spion Motor Besi All-Motorcycle.',
    isActive: true,
  },
  {
    slug: 'pembersih-kerak-panci',
    title: 'GlowHöme Gel Pembersih Kerak Hitam Panci & Wajan',
    productSlug: 'pembersih-kerak-180ml',
    description: 'Landing page direct-response konversi tinggi untuk GlowHöme Gel Pembersih Kerak Hitam Panci, Wajan & Kompor.',
    isActive: true,
  },
  {
    slug: 'nature-gemuk-badan',
    title: 'Nature Gemuk Badan Isi 60 Kapsul (Penggemuk Alami BPOM)',
    productSlug: 'nature-gemuk-badan-isi-60-kapsul',
    description: 'Landing page direct-response konversi tinggi untuk suplemen herbal penambah berat badan Nature Gemuk Badan.',
    isActive: true,
  },
  {
    slug: 'lem-jaysuing',
    title: 'Lem Anti Bocor Jaysuing 300gr Waterproof Transparan',
    productSlug: 'lem-anti-bocor-jaysuing-300gr',
    description: 'Landing page direct-response konversi tinggi untuk Lem Anti Bocor Jaysuing 300gr Waterproof Transparan.',
    isActive: true,
  },
  {
    slug: 'dt-kapsul',
    title: 'DT Kapsul M-Say Herbal Metabolisme & Pencernaan BPOM',
    productSlug: 'kapsul-dt-pelangsing-penurun-berat-badan-30-kapsul',
    description: 'Landing page direct-response konversi tinggi untuk suplemen herbal pendukung metabolisme dan pencernaan lancar DT Kapsul.',
    isActive: true,
  },
  {
    slug: 'gia-anti-sumbat',
    title: 'GIA Serbuk Anti Tersumbat 110g (Formula Kristal Melancarkan Pipa)',
    productSlug: 'serbuk-anti-tersumbat-110gr',
    description: 'Landing page direct-response konversi tinggi untuk GIA Serbuk Anti Tersumbat 110g peluruh lemak dan rambut.',
    isActive: true,
  },
  {
    slug: 'sabun-korea',
    title: 'Sabun Korea Glowing Pemutih Badan & Wajah 140g (BPOM Original)',
    productSlug: 'sabun-korea',
    description: 'Landing page direct-response konversi tinggi untuk Sabun Korea Glowing Pemutih Badan & Wajah 140g BPOM.',
    isActive: true,
  },
  {
    slug: 'minyak-kemiri',
    title: 'Minyak Kemiri Bakar Murni Penumbuh Rambut & Brewok 100ml',
    productSlug: 'minyak-kemiri',
    description: 'Landing page direct-response konversi tinggi untuk Minyak Kemiri Bakar Murni Penumbuh Rambut & Brewok 100ml.',
    isActive: true,
  },
  {
    slug: '4g-lucky',
    title: '4G Lucky Spray Herbal Pria Dewasa (Intimate Hygiene)',
    productSlug: '4g-lucky-spray-herbal-pria-dewasa',
    description: 'Landing page direct-response konversi tinggi untuk 4G Lucky Spray Herbal Pria Dewasa & Intimate Hygiene.',
    isActive: true,
  },
  {
    slug: 'fertani-essen-ikan-120x',
    title: 'Fertani Essen Ikan 120X (Formula Konsentrat Kapsul Pemikat Ikan Kolam)',
    productSlug: 'fertani-essen-ikan-120x',
    description: 'Landing page direct-response konversi tinggi untuk Fertani Essen Ikan 120X kapsul pemikat ikan kolam lele, mas, nila, patin.',
    image: '/images/landing/essen-ikan-120x/hero-product.webp',
    isActive: true,
  },
  {
    slug: 'foam-pembersih-toilet-500ml',
    title: 'GlowHome Foam Pembersih Toilet 500ml (Busa Aktif Pembersih Kerak & Noda Kloset)',
    productSlug: 'foam-pembersih-toilet-500ml',
    description: 'Landing page direct-response konversi tinggi untuk GlowHome Foam Pembersih Toilet 500ml busa aktif anti kerak, jamur, noda air membandel.',
    image: '/images/landing/foam-toilet/hero-product.webp',
    isActive: true,
  },
  // Recovered 2026-10-18 from production: deployed from another device on
  // 2026-10-13/14 and never pushed. Titles and descriptions are the rows the
  // hourly reconcile wrote from the deployed register, so they round-trip.
  {
    slug: 'alat-cukur-travel-pocket',
    title: 'Alat Cukur Travel Pocket Portable USB Mini Shaver',
    productSlug: 'alat-cukur-travel-pocket',
    description: 'Landing page direct-response konversi tinggi untuk Alat Cukur Listrik Portable Travel Pocket USB Type-C.',
    image: '/images/landing/alat-cukur-travel-pocket/hero-product.webp',
    isActive: true,
  },
  {
    slug: 'wamena-oil',
    title: 'Wamena Oil Minyak Herbal Pria Papua BPOM',
    productSlug: 'wamena-oil',
    description: 'Landing page direct-response konversi tinggi untuk Wamena Oil Minyak Herbal Perawatan Vitalitas Pria Tradisional Papua BPOM.',
    image: '/images/landing/wamena-oil/hero-product.webp',
    isActive: true,
  },
  {
    slug: 'asam-humat-premium',
    title: 'Asam Humat Premium 500gr — Pembenah Tanah Organik & Penyubur Akar',
    productSlug: 'asam-humat-premium',
    description: 'Landing page direct-response untuk Asam Humat Premium 500gr pembenah struktur tanah keras dan penguat perakaran tanaman.',
    image: '/images/landing/asam-humat-premium/hero-product.webp',
    isActive: true,
  },
  {
    slug: 'deterjen-pakaian-dalam-300ml',
    title: 'GlowHome Lingerie Wash 300ml — Pembersih Noda Pakaian Dalam Wanita',
    productSlug: 'deterjen-pakaian-dalam-300ml',
    description: 'Landing page direct-response untuk GlowHome Lingerie Wash 300ml deterjen enzim khusus pengangkat noda darah haid & kekuningan.',
    image: '/images/landing/deterjen-pakaian-dalam-300ml/hero-product.webp',
    isActive: true,
  },
  {
    slug: 'dragon-blood-cream',
    title: 'Bundling Dragon Blood Cream 50g (Beli 1 Gratis 1 — Dapat 2 Pot)',
    productSlug: 'dragon-blood-cream',
    description: 'Landing page direct-response untuk paket bundling hemat Dragon Blood Cream 50g Beli 1 Gratis 1 pelembap & pencerah wajah.',
    image: '/images/landing/dragon-blood-cream/hero-product.webp',
    isActive: true,
  },
  {
    slug: 'fertani-herbisida',
    title: 'Fertani Herbisida Pembasmi Rumput Liar 250gr Sampai Akar',
    productSlug: 'fertani-herbisida-pembasmi-rumput-250gram',
    description: 'Landing page direct-response untuk Fertani Herbisida 250gr pembasmi rumput liar dan gulma membandel hingga ke akar.',
    image: '/images/landing/fertani-herbisida/hero-product.webp',
    isActive: true,
  },
  {
    slug: 'fertani-penggemuk-ikan',
    title: 'Fertani Suplemen Penggemuk Ikan Air Tawar 250gr — Campuran Pakan Pelet',
    productSlug: 'fertani-penggemuk-ikan',
    description: 'Landing page direct-response untuk Fertani Suplemen Penggemuk Ikan Air Tawar 250gr premix peningkat nafsu makan ikan budidaya.',
    image: '/images/landing/fertani-penggemuk-ikan/hero-product.webp',
    isActive: true,
  },
  {
    slug: 'ginseng-cordyceps',
    title: 'Tablet Ginseng Cordyceps Sinensis Ochiban 500mg — Suplemen Stamina',
    productSlug: 'ginseng-cordyceps',
    description: 'Landing page direct-response untuk Tablet Ginseng Cordyceps Sinensis Ochiban 500mg suplemen stamina dan daya tahan tubuh.',
    image: '/images/landing/ginseng-cordyceps/hero-product.webp',
    isActive: true,
  },
  {
    slug: 'kapsul-herbal-brotowali',
    title: 'Kapsul Herbal Brotowali Alami (Isi 50 Kapsul)',
    productSlug: 'kapsul-herbal-brotowali',
    description: 'Landing page direct-response untuk Kapsul Herbal Brotowali 50 Kapsul penjaga daya tahan tubuh & kebugaran tanpa rasa pahit.',
    image: '/images/landing/kapsul-herbal-brotowali/hero-product.webp',
    isActive: true,
  },
  {
    slug: 'kapsul-herbal-gurah',
    title: 'Kapsul Herbal Gurah 60 Kapsul — Perawatan Tenggorokan & Pernapasan BPOM',
    productSlug: 'kapsul-herbal-gurah',
    description: 'Landing page direct-response untuk Kapsul Herbal Gurah 60 Kapsul resmi BPOM TR213305391 pereda batuk berdahak & pelega tenggorokan.',
    image: '/images/landing/kapsul-herbal-gurah/hero-product.webp',
    isActive: true,
  },
  {
    slug: 'kapsul-pinang-muda',
    title: 'Kapsul Buah Pinang Muda Herbal Alami (Isi 25 Kapsul)',
    productSlug: 'kapsul-pinang-muda',
    description: 'Landing page direct-response untuk suplemen Kapsul Buah Pinang Muda penjaga stamina, vitalitas, dan daya tahan tubuh pria.',
    image: '/images/landing/kapsul-pinang-muda/hero-product.webp',
    isActive: true,
  },
  {
    slug: 'karclean-pembersih-kerak',
    title: 'KARCLEAN Cairan Pembersih Kerak Kamar Mandi, Keramik & Kloset',
    productSlug: 'karclean-pembersih-kerak',
    description: 'Landing page direct-response untuk KARCLEAN Cairan Pembersih Kerak Kamar Mandi pengangkat kerak air, noda kuning kloset & wastafel.',
    image: '/images/landing/karclean-pembersih-kerak/hero-product.webp',
    isActive: true,
  },
  {
    slug: 'lao-li-shi-collagen',
    title: 'LAO LI SHI Collagen Wire Drawing Cream 50g — Krim Kolagen Wajah',
    productSlug: 'lao-li-shi-collagen',
    description: 'Landing page direct-response untuk LAO LI SHI Collagen Wire Drawing Cream 50g pelembap & perawatan elastisitas kulit wajah.',
    image: '/images/landing/lao-li-shi-collagen/hero-product.webp',
    isActive: true,
  },
  {
    slug: 'lipoma-cream-herbal',
    title: 'Zhi Fang Liu Cream 30g — Krim Herbal Perawatan Area Kulit',
    productSlug: 'lipoma-cream-herbal',
    description: 'Landing page direct-response untuk Zhi Fang Liu Herbal Cream 30g krim oles perawatan luar area kulit tubuh.',
    image: '/images/landing/lipoma-cream-herbal/hero-product.webp',
    isActive: true,
  },
  {
    slug: 'omega-brain-dha',
    title: 'Omega Brain High DHA Fish Oil (Isi 60 Softgel) — Suplemen Nutrisi Fokus',
    productSlug: 'omega-brain-dha',
    description: 'Landing page direct-response untuk Omega Brain High DHA Fish Oil 60 Softgel suplemen minyak ikan Omega-3 nutrisi fokus & memori.',
    image: '/images/landing/omega-brain-dha/hero-product.webp',
    isActive: true,
  },
  {
    slug: 'pembersih-interior-mobil',
    title: 'GlowHome Semprotan Pembersih Interior Mobil & Jok 450ml',
    productSlug: 'pembersih-interior-mobil',
    description: 'Landing page direct-response untuk GlowHome Semprotan Pembersih Interior Mobil 450ml pembersih jok, plafon & dashboard tanpa bilas.',
    image: '/images/landing/pembersih-interior-mobil/hero-product.webp',
    isActive: true,
  },
  {
    slug: 'pembersih-kulkas-glowhome',
    title: 'GlowHome Semprotan Pembersih Kulkas & Dapur 450ml',
    productSlug: 'pembersih-kulkas-glowhome',
    description: 'Landing page direct-response untuk GlowHome Semprotan Pembersih Kulkas 450ml pengangkat noda makanan & bau amis tanpa bilas.',
    image: '/images/landing/pembersih-kulkas-glowhome/hero-product.webp',
    isActive: true,
  },
  {
    slug: 'pupuk-pelebat-buah',
    title: 'Pupuk Pelebat Tanaman Buah & Perangsang Bunga 250gr',
    productSlug: 'pupuk-pelebat-buah',
    description: 'Landing page direct-response untuk Pupuk Pelebat Tanaman Buah 250gr nutrisi pembungaan dan anti rontok tanaman buah.',
    image: '/images/landing/pupuk-pelebat-buah/hero-product.webp',
    isActive: true,
  },
  {
    slug: 'rendaman-kaki-tabib',
    title: 'Bundling Get 3 Kaki Tabib — Rempah Rendaman Kaki Pegal & Relaksasi',
    productSlug: 'rendaman-kaki-tabib',
    description: 'Landing page direct-response untuk Bundling Get 3 Kaki Tabib (15g) ramuan rempah rendaman kaki hangat untuk relaksasi & bau kaki.',
    image: '/images/landing/rendaman-kaki-tabib/hero-product.webp',
    isActive: true,
  },
  {
    slug: 'semprotan-mata-herbal',
    title: 'Warzn Soothing Eye Spray 10ml — Semprotan Penyegar Area Mata Lelah',
    productSlug: 'semprotan-mata-herbal',
    description: 'Landing page direct-response untuk Warzn Soothing Eye Spray 10ml semprotan kabut halus penyegar area mata lelah.',
    image: '/images/landing/semprotan-mata-herbal/hero-product.webp',
    isActive: true,
  },
  {
    slug: 'so-easy-pembersih-mesin-cuci',
    title: 'So Easy Pembersih Tabung Mesin Cuci (Isi 2 Pack)',
    productSlug: 'so-easy-pembersih-mesin-cuci',
    description: 'Landing page direct-response untuk So Easy Pembersih Tabung Mesin Cuci 2PCS peluruh kerak, lumut & bau apek tabung mesin cuci.',
    image: '/images/landing/so-easy-pembersih-mesin-cuci/hero-product.webp',
    isActive: true,
  },
  {
    slug: 'syaraf-kejepit-herbal',
    title: 'Kapsul Herbal Syaraf Kejepit 500mg (Isi 50 Kapsul)',
    productSlug: 'syaraf-kejepit-herbal',
    description: 'Landing page direct-response untuk suplemen Kapsul Herbal Syaraf Kejepit 500mg perawatan saraf, pinggang, dan persendian.',
    image: '/images/landing/syaraf-kejepit-herbal/hero-product.webp',
    isActive: true,
  },
  {
    slug: 'theravol-natural-oil',
    title: '[Theravol] Natural Oil — Minyak Urut Herbal Pria BPOM NA18260103165',
    productSlug: 'theravol-natural-oil',
    description: 'Landing page direct-response untuk Theravol Natural Oil Minyak Urut Herbal Pria terdaftar resmi BPOM NA18260103165.',
    image: '/images/landing/theravol-natural-oil/hero-product.webp',
    isActive: true,
  },
  {
    slug: 'tiga-jari-oil',
    title: '[Theravol] Tiga Jari Oil — Minyak Oles Herbal Pria 30ml BPOM',
    productSlug: 'tiga-jari-oil',
    description: 'Landing page direct-response untuk Theravol Tiga Jari Oil 30ml Minyak Oles Herbal Pria terdaftar resmi BPOM NA18240118218.',
    image: '/images/landing/tiga-jari-oil/hero-product.webp',
    isActive: true,
  },
  {
    slug: 'gia-bubuk-anti-tersumbat',
    title: 'GIA Bubuk Anti Tersumbat 110gr (2 Menit Langsung Lancar)',
    productSlug: 'gia-bubuk-anti-tersumbat-110gri',
    description: 'Landing page direct-response konversi tinggi untuk GIA Bubuk Anti Tersumbat 110gr kemasan sachet konsentrat peluruh sumbatan pipa, wastafel, dan kloset WC.',
    image: '/images/landing/gia-bubuk-anti-tersumbat/seller-3.webp',
    isActive: true,
  },
  {
    slug: 'adaptor-mesin-bor',
    title: 'Adaptor Mesin Bor ke Gergaji Reciprocating — Ubah Bor Jadi Gergaji Mesin',
    productSlug: 'adaptor-mesin-bor',
    description: 'Landing page direct-response untuk Adaptor Mesin Bor konverter gergaji bolak-balik lengkap dengan 3 mata pisau potong kayu & besi.',
    image: '/assets/uploads/2026-08-18/6688310a-e5b2-4ff2-82d7-e5a4a37b22d9.webp',
    isActive: true,
  },
  {
    slug: 'alat-cukur-rambut-elektronik',
    title: 'Alat Cukur Rambut Elektronik T9 Cordless Trimmer Pisau Baja Presisi',
    productSlug: 'alat-cukur-rambut-elektronik',
    description: 'Landing page direct-response untuk Alat Cukur Rambut Elektronik T9 rechargeable untuk cukur rambut, kumis, jenggot & gradasi rapi di rumah.',
    image: '/assets/uploads/2026-08-18/b5047405-fa56-4f76-a07b-1e57d245825e.webp',
    isActive: true,
  },
  {
    slug: 'albumichenna-ekstrak-ikan-gabus-30-kapsul',
    title: 'Albumichenna Premium Ekstrak Ikan Gabus 30 Kapsul BPOM TR263002301',
    productSlug: 'albumichenna-ekstrak-ikan-gabus-30-kapsul',
    description: 'Landing page direct-response untuk Albumichenna Ekstrak Ikan Gabus Channa Striata 30 Kapsul 500mg suplemen albumin pemulihan tubuh & luka.',
    image: '/assets/uploads/2026-08-18/2767dff7-b0df-411f-8d3f-a9e63f43a4ed.webp',
    isActive: true,
  },
  {
    slug: 'bastrix-pupdeo',
    title: 'Bastrix Pupdeo — Bubuk Penghilang Bau Litterbox Kucing & Anabul',
    productSlug: 'bastrix-pupdeo',
    description: 'Landing page direct-response untuk Bastrix Pupdeo bubuk deodorant penghilang bau kotoran & pesing pasir kucing tahan 7 hari.',
    image: '/assets/uploads/2026-09-10/646437a8-e1cc-4b16-a929-1afbf5df4d9d.webp',
    isActive: true,
  },
  {
    slug: 'bastrix-salep-anti-scabies-jamur',
    title: 'Bastrix Salep Anti Scabies & Jamur Kucing Anjing Kelinci 15g',
    productSlug: 'bastrix-salep-anti-scabies-jamur',
    description: 'Landing page direct-response untuk Bastrix Salep Anti Scabies & Jamur 15g krim perawatan kulit anabul gatal, kudis, koreng & bulu rontok.',
    image: '/assets/uploads/2026-09-10/25feccbc-cb61-432c-a54b-0bfa6a5e963c.webp',
    isActive: true,
  },
  {
    slug: 'baterai-cadangan-mesin-jet',
    title: 'Baterai Cadangan Mesin Jet Cleaner Lithium High-Capacity Tahan Lama',
    productSlug: 'baterai-cadangan-mesin-jet',
    description: 'Landing page direct-response untuk Baterai Cadangan Mesin Jet Cleaner cordless daya semprot stabil tanpa jeda cuci mobil & motor.',
    image: '/assets/uploads/2026-08-18/fcb7c021-3950-43f6-aab9-b1ea766f2c34.webp',
    isActive: true,
  },
  {
    slug: 'dr-haechung-spray-pembasmi-jamur-250ml',
    title: 'Dr. Haechung Spray Pembasmi Jamur Dinding, Plafon & Kamar Mandi 250ml',
    productSlug: 'dr-haechung-spray-pembasmi-jamur-250ml',
    description: 'Landing page direct-response untuk Dr. Haechung Spray Pembasmi Jamur 250ml peluruh bercak jamur hitam dinding & plafon lembap.',
    image: '/assets/uploads/2026-08-18/251f1cbc-b2e7-46ff-8f1d-e5df8a961a0a.webp',
    isActive: true,
  },
  {
    slug: 'dr-haechung-spray-pengusir-tikus-rumah-250ml',
    title: 'Dr. Haechung Spray Pengusir Tikus Rumah & Kap Mobil 250ml',
    productSlug: 'dr-haechung-spray-pengusir-tikus-rumah-250ml',
    description: 'Landing page direct-response untuk Dr. Haechung Spray Pengusir Tikus Rumah & Kap Mobil 250ml formula esensial pengusir tikus tanpa bangkai.',
    image: '/assets/uploads/2026-08-18/e7bfaf92-89cd-4d99-89c4-1cf20cee574a.webp',
    isActive: true,
  },
  {
    slug: 'gel-racun-kecoa',
    title: 'Gel Racun Kecoa Ampuh — Umpan Gel Pembasmi Kecoa Sampai Sarang',
    productSlug: 'gel-racun-kecoa',
    description: 'Landing page direct-response untuk Gel Racun Kecoa suntikan umpan berantai pembasmi koloni kecoa dapur & kamar mandi.',
    image: '/assets/uploads/2026-08-18/7b252f13-3f04-4c39-af36-c0cfdde96655.webp',
    isActive: true,
  },
  {
    slug: 'gergaji-mini-serbaguna',
    title: 'Gergaji Mini Serbaguna Baja Tajam — Potong Kayu, Pipa PVC & Dahan Cepat',
    productSlug: 'gergaji-mini-serbaguna',
    description: 'Landing page direct-response untuk Gergaji Mini Serbaguna mata gergaji baja karbon tajam dengan gagang ergonomis anti selip.',
    image: '/assets/uploads/2026-08-18/dc93ca13-8c0d-4fe9-a052-338625d441d2.webp',
    isActive: true,
  },
  {
    slug: 'hair-care-essence',
    title: 'Scentnice Hair Care Essence 100ml — Serum Vitamin Rambut Halus Berkilau',
    productSlug: 'hair-care-essence',
    description: 'Landing page direct-response untuk Scentnice Hair Care Essence 100ml serum nutrisi pelindung rambut kering, bercabang & mengembang.',
    image: '/assets/uploads/2026-09-10/4c747f1d-f18e-43ba-8416-137b29416450.webp',
    isActive: true,
  },
  {
    slug: 'hair-tonic-scentnice',
    title: 'Scentnice Premium Hair Tonic 100ml — Nutrisi Akar Rambut Anti Rontok',
    productSlug: 'hair-tonic-scentnice',
    description: 'Landing page direct-response untuk Scentnice Hair Tonic 100ml penguat akar rambut rontok dan penyegar kulit kepala bebas ketombe.',
    image: '/assets/uploads/2026-09-11/bffb0196-b70f-4610-bd8e-10320f1d801d.webp',
    isActive: true,
  },
  {
    slug: 'kabel-cas-smartwacth',
    title: 'Kabel Cas Smartwatch Magnetic USB — Daya Stabil & Anti Lepas',
    productSlug: 'kabel-cas-smartwacth',
    description: 'Landing page direct-response untuk Kabel Cas Smartwatch Magnetic USB dengan proteksi arus pendek dan daya rekat magnet presisi.',
    image: '/assets/uploads/2026-08-18/e746a851-f982-4aad-8d8b-f0550cc597ec.webp',
    isActive: true,
  },
  {
    slug: 'kabel-data-3-in-1',
    title: 'Kabel Data 3 In 1 Fast Charging — Type-C, Micro USB & Lightning sekaligus',
    productSlug: 'kabel-data-3-in-1',
    description: 'Landing page direct-response untuk Kabel Data 3 In 1 Fast Charging nilon braided anti putus untuk semua jenis smartphone.',
    image: '/assets/uploads/2026-08-18/aa7eb4b1-87ed-4d79-a0d1-02ecbe696a3e.webp',
    isActive: true,
  },
  {
    slug: 'kabel-data-4-in-1',
    title: 'Kabel Data 4 In 1 Fast Charging 65W — Konektor Lengkap Semua Perangkat',
    productSlug: 'kabel-data-4-in-1',
    description: 'Landing page direct-response untuk Kabel Data 4 In 1 Fast Charging kombinasi USB-A, Type-C & Lightning untuk HP, tablet dan laptop.',
    image: '/assets/uploads/2026-08-18/d9680ffc-23b9-4afe-a472-c9635e46e5a8.webp',
    isActive: true,
  },
  {
    slug: 'kompor-gas-portabel',
    title: 'Kompor Gas Portabel 2-in-1 — Api Biru Tornado Praktis & Aman',
    productSlug: 'kompor-gas-portabel',
    description: 'Landing page direct-response untuk Kompor Gas Portabel 2-in-1 untuk kaleng gas butane & LPG dengan pemantik otomatis dan koper penyimpanan.',
    image: '/assets/uploads/2026-08-18/752a8603-57e0-4bf5-9a6d-0a92d1bd2bd2.webp',
    isActive: true,
  },
  {
    slug: 'korektor-postur-punggung',
    title: 'Korektor Postur Punggung Adjustable — Penyangga Bahu & Tulang Belakang Tegak',
    productSlug: 'korektor-postur-punggung',
    description: 'Landing page direct-response untuk Korektor Postur Punggung penyangga bahu bungkuk dan pereda pegal punggung saat duduk kerja.',
    image: '/assets/uploads/2026-08-18/fbdcdbb8-39c9-43a8-a2ce-f908c1851673.webp',
    isActive: true,
  },
  {
    slug: 'lampu-led-5-titik',
    title: 'Lampu LED 5 Titik Baling-Baling Lipat Super Terang Fitting E27',
    productSlug: 'lampu-led-5-titik',
    description: 'Landing page direct-response untuk Lampu LED 5 Titik model baling-baling lipat 90 derajat hemat daya penerangan merata seluruh ruangan.',
    image: '/assets/uploads/2026-08-24/a96af3bb-1e44-4855-beab-cd50d4ad1ff1.webp',
    isActive: true,
  },
  {
    slug: 'lampu-led-lentera',
    title: 'Lampu LED Lentera Emergency Solar & USB Rechargeable 360 Derajat',
    productSlug: 'lampu-led-lentera',
    description: 'Landing page direct-response untuk Lampu LED Lentera Emergency tarik 360 derajat tenaga surya & cas USB penyelamat mati lampu dan camping.',
    image: '/assets/uploads/2026-08-18/c44ad6a6-9d8d-4a15-bd16-ee137eaf5e34.webp',
    isActive: true,
  },
  {
    slug: 'lampu-led-multifungsi',
    title: 'Lampu LED Multifungsi Emergency & Dekorasi 3 Mode Cahaya Rechargeable',
    productSlug: 'lampu-led-multifungsi',
    description: 'Landing page direct-response untuk Lampu LED Multifungsi tempel magnetik tanpa instalasi kabel untuk kamar, meja belajar & darurat.',
    image: '/assets/uploads/2026-08-24/0b2cc5cb-b4f4-4595-a031-8bc38271bf61.webp',
    isActive: true,
  },
  {
    slug: 'lampu-senter-mini-gantungan',
    title: 'Lampu Senter Mini Gantungan Kunci COB LED Super Terang Multifungsi',
    productSlug: 'lampu-senter-mini-gantungan',
    description: 'Landing page direct-response untuk Lampu Senter Mini Gantungan Kunci COB LED floodlight magnetik tahan air dengan baterai cas USB.',
    image: '/assets/uploads/2026-08-18/109fcfdd-744a-4c30-8632-09217e8328cc.webp',
    isActive: true,
  },
  {
    slug: 'lampu-sepeda-led-360',
    title: 'Lampu Sepeda LED 360 Rotasi Tahan Air USB Rechargeable Super Terang',
    productSlug: 'lampu-sepeda-led-360',
    description: 'Landing page direct-response untuk Lampu Sepeda LED 360 derajat bracket putar fleksibel anti air untuk gowes malam aman.',
    image: '/assets/uploads/2026-08-18/c3b65376-f91c-49fe-ae74-783166f3b9bd.webp',
    isActive: true,
  },
  {
    slug: 'minyak-kemiri-bakar',
    title: 'Minyak Kemiri Bakar 100ml — Perawatan Rambut Hitam Tebal Anti Rontok',
    productSlug: 'minyak-kemiri-bakar',
    description: 'Landing page direct-response untuk Minyak Kemiri Bakar 100ml nutrisi alami penyubur rambut, penghitam uban & penumbuh brewok.',
    image: '/assets/uploads/2026-09-10/1530c3b0-ef97-4220-968a-f08881ea3342.webp',
    isActive: true,
  },
  {
    slug: 'pembersih-jamur-kaca-450ml',
    title: 'Pembersih Jamur Kaca Mobil & Kamar Mandi 450ml — Kaca Bening Sekali Usap',
    productSlug: 'pembersih-jamur-kaca-450ml',
    description: 'Landing page direct-response untuk Pembersih Jamur Kaca 450ml pengangkat kerak air membandel dan buram pada kaca mobil serta shower box.',
    image: '/assets/uploads/2026-08-18/21436512-9d87-4753-aeb7-add957d7910c.webp',
    isActive: true,
  },
  {
    slug: 'power-bank-mini-analog',
    title: 'Power Bank Mini Pocket Fast Charging — Praktis Tanpa Ribet Kabel',
    productSlug: 'power-bank-mini-analog',
    description: 'Landing page direct-response untuk Power Bank Mini Pocket kapasitas padat dengan konektor terintegrasi anti lowbat saat bepergian.',
    image: '/assets/uploads/2026-08-18/cae49f6e-01b1-4126-be25-9990af00826e.webp',
    isActive: true,
  },
  {
    slug: 'sabun-pencerah-korea',
    title: 'Prime Sabun Pencerah Korea — Sabun Glowing Wajah & Tubuh',
    productSlug: 'sabun-pencerah-korea',
    description: 'Landing page direct-response untuk Sabun Pencerah Korea pembersih daki, lipatan gelap, dan pencerah kulit wajah serta badan.',
    image: '/assets/uploads/2026-09-10/de3ba926-6c8c-4b2f-9357-7849afb80df2.webp',
    isActive: true,
  },
  {
    slug: 'senter-led-portable',
    title: 'Senter LED Portable Tactical Zoom Jarak Jauh Rechargeable Tahan Air',
    productSlug: 'senter-led-portable',
    description: 'Landing page direct-response untuk Senter LED Portable Tactical sorot jarak jauh dengan lampu samping COB dan pengisian daya USB.',
    image: '/assets/uploads/2026-08-18/b5084e17-4bea-4742-8653-af0ba95f4494.webp',
    isActive: true,
  },
  {
    slug: 'shoe-parfume-clean',
    title: 'Shoe Clean Parfume 60ml — Semprotan Pengharum Sepatu Anti Bau Apek',
    productSlug: 'shoe-parfume-clean',
    description: 'Landing page direct-response untuk Shoe Clean Parfume 60ml parfum antibakteri penetral bau sepatu, helm, kaos kaki & tas.',
    image: '/assets/uploads/2026-09-11/46cb8b81-6e8a-4a18-9d0c-48cf0db3a71a.webp',
    isActive: true,
  },
  {
    slug: 'tas-selempang-unisex',
    title: 'Tas Selempang Unisex Sling Bag Waterproof Kompartemen Luas',
    productSlug: 'tas-selempang-unisex',
    description: 'Landing page direct-response untuk Tas Selempang Unisex berbahan nilon tahan cipratan air dengan banyak saku untuk pria dan wanita.',
    image: '/assets/uploads/2026-08-18/c4742e9d-ec6e-461e-bf16-c18d726dfbac.webp',
    isActive: true,
  },
  {
    slug: 'tongsis-led',
    title: 'Tongsis Tripod Bluetooth 4-in-1 dengan Lampu LED Fill Light Stabil',
    productSlug: 'tongsis-led',
    description: 'Landing page direct-response untuk Tongsis Tripod Bluetooth dilengkapi lampu LED fill light dan remote wireless untuk foto & konten video.',
    image: '/assets/uploads/2026-08-18/a2791c69-b5d7-491d-802d-4bc8a30317ba.webp',
    isActive: true,
  },
  {
    slug: 'celana-knit-jumbo',
    title: 'Celana Knit Jumbo Kulot Rib Adem Melar BB 55-85 Kg',
    productSlug: 'celana-knit-jumbo',
    description: 'Celana Knit Jumbo model kulot longgar tanpa saku berbahan Knit Rib adem dan melar dengan pinggang full karet elastis.',
    image: '/images/landing/celana-knit-jumbo/hero-product.webp',
    isActive: true,
  },
];

/**
 * Other top-level route files this install serves that are not landing pages —
 * a legacy slug that 301s to a renamed page, say. A CMS landing page on one of
 * these slugs would save and never be reachable, because the route file
 * answers first, so the CMS refuses them. Every entry in `nativeLandingPages`
 * is refused the same way without being repeated here.
 */
export const installRouteSlugs: string[] = [
  // 301s to the renamed landing pages.
  'kapsul-dt',
  'gia-serbuk-anti-tersumbat',
  'lem-anti-bocor-jaysuing',
  // The first GIA page, retired for /gia-anti-sumbat (same product); kept as a
  // 301 so an ad or link still pointing at it lands on the live page.
  'pembersih-saluran-tersumbat',
  'essen-ikan-120x',
];
