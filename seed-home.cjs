import { execSync } from 'child_process';

const homeContent = {
  hero: {
    title: "Koleksi Terbaik Zvara",
    description: "Temukan produk unggulan dengan kualitas terbaik untuk kebutuhan Anda.",
    ratingLabel: "Berdasarkan ulasan pelanggan"
  },
  catalog: {
    eyebrow: "PRODUK KAMI",
    title: "Pilih Sesuai Gaya Anda",
    description: "Berbagai pilihan produk yang dirancang untuk kenyamanan dan gaya."
  },
  solutionsHeading: {
    eyebrow: "KEUNGGULAN",
    title: "Mengapa Memilih Kami?",
    description: "Kami memberikan pengalaman berbelanja terbaik."
  },
  proofsHeading: {
    eyebrow: "TESTIMONI",
    title: "Apa Kata Mereka?",
    description: "Dengarkan pengalaman pelanggan setia kami."
  },
  heroHighlights: [
    { label: "Bahan Berkualitas", icon: "Check" },
    { label: "Pengiriman Cepat", icon: "Truck" }
  ],
  heroSlides: [
    {
      image: "https://zvara.shop/images/hero-1.webp",
      alt: "Koleksi Zvara",
      badge: "Koleksi Baru",
      text: "Tingkatkan gaya Anda dengan koleksi terbaru dari Zvara."
    }
  ],
  solutions: [
    {
      title: "Garansi Kualitas",
      excerpt: "Setiap produk melewati pengecekan ketat.",
      image: "https://zvara.shop/images/sol-1.webp"
    }
  ],
  proofs: []
};

const jsonStr = JSON.stringify(homeContent);

const sql = `
  INSERT INTO storefront_content (content_key, draft_json, published_json, updated_at)
  VALUES ('home', '${jsonStr}', '${jsonStr}', CURRENT_TIMESTAMP)
  ON CONFLICT(content_key) DO UPDATE SET published_json = '${jsonStr}', updated_at = CURRENT_TIMESTAMP;
`;

// Save SQL to a file and run wrangler d1 execute
const fs = require('fs');
fs.writeFileSync('/tmp/seed_home.sql', sql);
console.log("Seeding local database...");
try {
  execSync('npx wrangler d1 execute zvarashop-d1 --local --file=/tmp/seed_home.sql', { stdio: 'inherit' });
  console.log("Local database seeded successfully.");
} catch (e) {
  console.error("Failed to seed local db:", e.message);
}

console.log("Seeding remote database...");
try {
  execSync('npx wrangler d1 execute zvarashop-d1 --remote --file=/tmp/seed_home.sql', { stdio: 'inherit' });
  console.log("Remote database seeded successfully.");
} catch (e) {
  console.error("Failed to seed remote db:", e.message);
}
