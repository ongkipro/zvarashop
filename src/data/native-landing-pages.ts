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
 *   3. deploy. The CMS picks it up on the next landing-page list load.
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
  /** A page can be registered before it is ready to be linked. */
  isActive?: boolean;
};

export const nativeLandingPages: NativeLandingPage[] = [
  {
    slug: 'pembersih-saluran-tersumbat',
    title: 'GlowHome Pembersih Saluran Tersumbat 500ml',
    productSlug: 'pemersih-saluran-tersumbat-110ml',
    description: 'Landing page konversi untuk campaign pembersih saluran GlowHome.',
    isActive: true,
  },
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
];
