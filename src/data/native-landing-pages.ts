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
    productSlug: 'pemersih-saluran-tersumbat-100ml',
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
];
