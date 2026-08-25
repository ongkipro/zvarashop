# Native Direct-Response Landing Page Specification & AI Blueprint

> **Standard Blueprint for High-Converting Astro Landing Pages in AdsBookCMS / Zvarashop**  
> **Framework Origin:** Petani Sejahtera Direct-Response Conversion Engine  
> **Language Policy:** Bahasa Indonesia Baku/Santai (Bukan Bahasa Melayu/Malaysia)  
> **Last Verified:** 2026-08-25

---

## 1. The 10-Section Conversion Architecture

Every native landing page lives at `src/pages/<slug>.astro` and answers directly at `domain.com/<slug>`. It follows a strict 10-section psychological progression:

```
┌────────────────────────────────────────────────────────┐
│  1. HERO SECTION                                       │
│     Punchy H1 with Marker Gradient + 3D Action Photo   │
│     + Floating Glassmorphic Benefit Card + Trust Strip │
├────────────────────────────────────────────────────────┤
│  2. CORE VALUE PROPOSITION / HOOK                      │
│     "Senjata pemusnah..." + 3 Benefit Checklist Cards  │
├────────────────────────────────────────────────────────┤
│  3. AGITATION & DANGER SIGNS (bg-[#FFF7ED])            │
│     Critical warning points on pain, loss & hazard     │
├────────────────────────────────────────────────────────┤
│  4. ROOT CAUSE BREAKDOWN                               │
│     Why common fixes fail + 2 Real Problem Photos      │
├────────────────────────────────────────────────────────┤
│  5. DARK CONTRAST PROOF & HOW-TO (bg-[#0B1E36])        │
│     Before vs After comparison + 3 Step Action Guide   │
├────────────────────────────────────────────────────────┤
│  6. INFOGRAPHIC & PRODUCT ASSETS                       │
│     Clean vertical feature / benefit illustration      │
├────────────────────────────────────────────────────────┤
│  7. AUTHENTIC SOCIAL PROOF (OPEN EDITORIAL PATTERN)    │
│     Indonesian Avatars + 16:9 Proof Photos + Highlights│
├────────────────────────────────────────────────────────┤
│  8. 100% RISK REVERSAL GUARANTEE (bg-[#0F2942])        │
│     Gold shield icon + 3 Trust Assurance Cards (COD)   │
├────────────────────────────────────────────────────────┤
│  9. NATIVE HYBRID CHECKOUT FORM                        │
│     GeoIpResolvedForm 1:1 linked to D1 product catalog │
├────────────────────────────────────────────────────────┤
│ 10. STICKY CTA BAR & SOCIAL PROOF TOAST                │
│     Auto-hiding on Hero and Order Form viewport        │
└────────────────────────────────────────────────────────┘
```

---

## 2. Copywriting Rules & Direct-Response Principles

### A. Strict Vocabulary Rules (Bahasa Indonesia vs Bahasa Melayu)
Never use Malaysian / Malay vocabulary. Always use authentic, punchy Indonesian terms:

| ❌ Bahasa Melayu (DILARANG) | ✅ Bahasa Indonesia (WAJIB) |
|---|---|
| *singki* | **wastafel / bak cuci piring** |
| *tandas* | **toilet / kloset / WC** |
| *saliran* | **saluran pipa / drainase** |
| *berkesan* | **ampuh / terbukti / manjur** |
| *wang* | **uang / duit** |
| *pelanggan berpuas hati* | **pelanggan puas** |
| *kedai* | **toko** |
| *pos percuma* | **gratis ongkir** |

### B. Headline & Text Compression Guidelines
- **Headlines Must Be Punchy & Direct:** Cut out filler words. Jump straight to the core pain point or brutal outcome.
- **Marker Highlight Effect:** Use CSS inline background gradient for maximum visual punch:
  ```html
  <span class="box-decoration-clone px-0.5 text-[#C93A1B]"
    style="background-image: linear-gradient(to top, #FFD84D 0.22em, rgba(255,216,77,0) 0.22em); background-repeat: no-repeat; background-position: 0 94%; background-size: 100% 100%;">
    Hancurkan Lemak & Rambut Seketika Tanpa Bongkar Pipa!
  </span>
  ```
- **Editorial Keyword Highlighting in Testimonials:**
  - Pain point highlight: `<strong class="box-decoration-clone bg-red-100 px-1.5 pb-0.5 text-slate-950 font-semibold">mampet total gara-gara minyak beku</strong>`
  - Result highlight: `<strong class="box-decoration-clone bg-[#EFF6FF] px-1.5 pb-0.5 text-[#1E3A8A] font-semibold">langsung plong jebol seketika tanpa sisa!</strong>`

---

## 3. UI/UX & Layout Standards

1. **Mobile-First Container:** Max width `480px` (`max-w-[480px] mx-auto min-h-screen bg-white text-slate-950 pb-20`).
2. **Clean Hero (No Clutter):**
   - No distracting badge pills on top of the hero image.
   - Clean 3D product cross-section image.
   - Floating glassmorphic benefit card (`bg-white/95 backdrop-blur-md rounded-xl border border-blue-200/80 shadow-[0_14px_34px_rgba(30,58,138,0.14)] -mt-6`).
   - 3-column micro trust strip below the hero (`Bisa COD` | `Aman Pipa PVC` | `Rating 4.9/5`).
3. **Open Editorial Testimonials (No Boxed Card Frames):**
   - Fluid vertical flow separated by hairline gradients (`h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent`).
   - Verified buyer avatar (`48x48px` round).
   - Problem subtitle tag (`border border-slate-200 bg-slate-50 text-slate-700`).
   - **Clean 16:9 Proof Photo** (unobscured, no dark text banner overlays on top of the image).
   - Italic quote with left accent border (`border-l-2 border-[#1E3A8A]/35 pl-3.5`).
   - Key takeaway summary box (`📌 Poin Hasil: ...`).
4. **Smart Visibility Observers:**
   - **Sticky Purchase Bar:** Hidden when viewing `#landing-hero` and `#form-pemesanan`. Only shows during mid-page scroll.
   - **Social Proof Toast:** Uses `heroSelector="#landing-hero"` and `formSelector="#form-pemesanan"` so it never pops up over hero or checkout.

---

## 4. Master AI Prompts for Copywriting

Use these prompting formulas when generating copy for a new product landing page:

### Prompt 1: Hero & Hook Generation
```markdown
Peran: Senior Direct-Response Copywriter (gaya iklan agresif Petani Sejahtera).
Bahasa: 100% Bahasa Indonesia baku & santai (bukan Bahasa Melayu).
Produk: [Nama Produk & Manfaat Utama]
Target Audiens: Rumah tangga Indonesia yang mengalami masalah [Masalah Spesifik].

Tolong buatkan:
1. Headline H1 (maksimal 12-15 kata, menusuk ke inti masalah, ada highlight solusi).
2. Subheadline (maksimal 20 kata, kontras antara penderitaan masalah vs hasil instan setelah pakai produk).
3. Floating Card Copy (Judul pendek 3-4 kata + penjelasan 1 kalimat padat).
4. Hook Section (1 kalimat pembuka tajam + 3 poin checklist keunggulan teknis).
```

### Prompt 2: Agitation, Root Cause & How-To
```markdown
Buatkan copywriting untuk 3 bagian landing page berikut:
1. AGITASI KRITIS (3 tanda bahaya jika masalah dibiarkan, bikin pembaca merasa rugi/panik).
2. AKAR MASALAH / ROOT CAUSE (Jelaskan kenapa cara-cara konvensional gagal total, kenapa produk ini adalah solusi satu-satunya).
3. 3 LANGKAH CARA PAKAI (Sangat mudah, jelas, anti-ribet dalam 3 step bernomor).
```

### Prompt 3: Authentic Indonesian Testimonials
```markdown
Buatkan 3 review testimoni pelanggan yang sangat natural dan meyakinkan:
- Pelanggan 1: Ibu rumah tangga di kota besar (masalah dapur/sink).
- Pelanggan 2: Kepala keluarga / bapak-bapak (masalah kamar mandi/saluran air).
- Pelanggan 3: Pria / anak muda (masalah toilet/bau menyengat).

Format per testimoni:
- Nama & Kota
- Masalah Spesifik
- Cerita review (gaya bahasa jujur, sebutkan rasa frustasi sebelumnya dan kelegaan setelah pakai produk)
- Kalimat kesimpulan takeaway 1 baris.
```

---

## 5. Master AI Prompts for Image Generation

Use DeepMind `generate_image` or Midjourney/DALL-E with these exact prompt formulas:

### 1. Hero 3D Pipe Action Visual (Aspect Ratio `3:2` or `16:9`)
```
A realistic 3D cutaway cross-section of a household transparent PVC U-trap drainage pipe. Inside the bend of the pipe, a powerful glowing blue chemical formula is actively dissolving and disintegrating dense greasy food residue and organic clogs into clean bubbling water. Clean modern bathroom background with soft studio lighting, ultra-sharp 8k, cinematic product visualization.
```

### 2. Real Problem Photos (Aspect Ratio `3:2` or `16:9`)
**Sink Clogged Before:**
```
Realistic candid photo of a home kitchen stainless steel sink completely clogged with dirty stagnant water, floating food scraps and grease, water not draining. Natural kitchen lighting, authentic realistic home situation.
```
**Floor Drain Hair Clog:**
```
Close-up authentic photo of a bathroom floor drain clogged with a dense wet tangle of hair and soap scum, standing water overflowing onto wet ceramic floor tiles. Realistic household photo.
```

### 3. Solution Clean After Photo (Aspect Ratio `3:2` or `16:9`)
```
Realistic photo of a sparkling clean stainless steel kitchen sink, faucet running clean water creating a fast swirling vortex draining smoothly down the pipe without any clog or overflow. Clean kitchen countertop, bright natural daylight.
```

### 4. Authentic Indonesian Customer Avatars (Aspect Ratio `1:1`)
**Indonesian Mother:**
```
Close-up portrait photo of a cheerful 38-year-old Indonesian mother wearing a modern casual pastel hijab, smiling warmly at the camera in a clean home kitchen setting, natural smartphone selfie lighting, authentic and realistic Indonesian woman.
```
**Indonesian Father:**
```
Close-up portrait photo of a friendly 45-year-old Indonesian man in a casual polo shirt smiling naturally at home, realistic smartphone photo, authentic Indonesian middle-aged man.
```
**Indonesian Young Man:**
```
Close-up portrait photo of a 29-year-old Indonesian man in a casual t-shirt smiling warmly, natural indoor lighting, authentic everyday Indonesian male.
```

### 5. Natural Result Proof Photos (Aspect Ratio `16:9`)
**Sink Clean Proof:**
```
Casual smartphone photo of a clean kitchen sink with water draining smoothly down the drain hole, clean stainless steel basin, realistic unedited home review photo.
```
**Bathroom Drain Clean Proof:**
```
Casual smartphone photo taken from standing angle showing a clean bathroom floor drain with water flowing away rapidly into the drain without puddle, clean Indonesian bathroom tiles.
```
**Toilet Clean Proof:**
```
Authentic smartphone photo taken from a casual angle inside a real Indonesian home bathroom. Showing a clean white toilet bowl with fresh clean water flushing smoothly, typical Indonesian ceramic floor tiles, a plastic water dipper (gayung) or bidet sprayer on the side, natural indoor daylight, realistic unedited customer review photo.
```

---

## 6. Image Optimization & Compression Standards

Every image must be processed to **100% WebP** with file size **sub-50KB** (max 70KB).

### Node.js Sharp Compression Script
Save and run this script to batch convert and optimize images:

```javascript
// scripts/optimize-landing-images.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const srcDir = './raw-images';
const destDir = './public/images/landing/<slug>';

if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

fs.readdirSync(srcDir).forEach(async (file) => {
  if (!file.match(/\.(jpg|jpeg|png)$/i)) return;

  const baseName = path.parse(file).name;
  const isAvatar = baseName.includes('avatar') || baseName.includes('testi-ibu') || baseName.includes('testi-bapak');
  const targetWidth = isAvatar ? 300 : 800;

  const destFile = path.join(destDir, `${baseName}.webp`);
  await sharp(path.join(srcDir, file))
    .resize({ width: targetWidth, withoutEnlargement: true })
    .webp({ quality: 80, effort: 6 })
    .toFile(destFile);

  const sizeKb = Math.round(fs.statSync(destFile).size / 1024);
  console.log(`✓ Optimized ${baseName}.webp -> ${sizeKb} KB`);
});
```

---

## 7. D1 Catalog & Checkout Integration (Garis Lurus)

Every native landing page connects 1:1 to the D1 product catalog:

```astro
---
import { getStorefrontProduct } from '../lib/catalog';
import { resolveFormModeContext } from '../lib/form-mode';
import GeoIpResolvedForm from '../components/storefront/forms/GeoIpResolvedForm.astro';
import '../styles/form-hybrid.css';

export const prerender = false;

const SLUG = 'pembersih-saluran-tersumbat';
const PRODUCT_SLUG = 'pemersih-saluran-tersumbat-110ml';

const product = await getStorefrontProduct(Astro.locals, PRODUCT_SLUG);
if (!product) return Astro.rewrite('/404');

const formContext = await resolveFormModeContext(Astro.request);
---

<section id="form-pemesanan" class="mt-4 scroll-mt-6 overflow-hidden rounded-none bg-white p-2">
  <GeoIpResolvedForm
    mode={formContext.mode}
    province={formContext.province}
    productSlug={product.slug}
    embedded={true}
  />
</section>
```

### Manifest Entry (`src/data/native-landing-pages.ts`)
```typescript
export const nativeLandingPages: NativeLandingPage[] = [
  {
    slug: 'pembersih-saluran-tersumbat',
    title: 'GlowHome Pembersih Saluran Tersumbat 500ml',
    productSlug: 'pemersih-saluran-tersumbat-110ml',
    description: 'Landing page konversi pembersih saluran GlowHome.',
    isActive: true,
  },
];
```
