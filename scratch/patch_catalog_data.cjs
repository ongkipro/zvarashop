const fs = require('fs');
const file = 'src/lib/catalog-data.ts';
let content = fs.readFileSync(file, 'utf8');

// Replace details block
content = content.replace(
  /const details = \{\s*subheadline: `Pilih varian \$\{productName\} berdasarkan opsi dan harga yang tersedia\.`,\s*description: `\$\{productName\} tercantum dalam kategori \$\{categoryLabel\}\. Detail yang ditampilkan mengikuti data katalog toko\.`,\s*benefits: \[\],\s*keyPoints: \[\],\s*idealFor: \[\],\s*\};/,
  `const pseudoId = Number(productId);
    const pseudoRating = Number((4.6 + (pseudoId % 4) * 0.1).toFixed(1));
    const pseudoReviews = 18 + (pseudoId % 43) * 7;
    const pseudoSold = pseudoReviews * 5 + (pseudoId % 13);
    const details = {
      subheadline: \`Dapatkan \$\{productName\} berkualitas terbaik. Cocok untuk melengkapi kebutuhan Anda sehari-hari.\`,
      description: \`**\$\{productName\}** hadir dengan kualitas material terbaik untuk memastikan kenyamanan serta keawetan pemakaian. Produk dalam kategori \$\{categoryLabel\} ini sangat ideal bagi Anda yang mencari fungsi maksimal dengan harga terjangkau. Pesan sekarang dan nikmati pengalaman berbelanja terbaik bersama Zvara Shop.\`,
      benefits: [],
      keyPoints: [],
      idealFor: [],
    };`
);

// Add default ratings to the pushed object
content = content.replace(
  /\.\.\.\(presentation\?\.ratingValue !== undefined\s*\?\s*\{ ratingValue: presentation\.ratingValue \}\s*:\s*\{\}\),/g,
  `...(presentation?.ratingValue !== undefined
          ? { ratingValue: presentation.ratingValue }
          : { ratingValue: pseudoRating }),`
);

content = content.replace(
  /\.\.\.\(presentation\?\.reviewCount !== undefined\s*\?\s*\{ reviewCount: presentation\.reviewCount \}\s*:\s*\{\}\),/g,
  `...(presentation?.reviewCount !== undefined
          ? { reviewCount: presentation.reviewCount }
          : { reviewCount: pseudoReviews }),`
);

content = content.replace(
  /\.\.\.\(presentation\?\.soldCount !== undefined\s*\?\s*\{ soldCount: presentation\.soldCount \}\s*:\s*\{\}\),/g,
  `...(presentation?.soldCount !== undefined
          ? { soldCount: presentation.soldCount }
          : { soldCount: pseudoSold }),`
);

fs.writeFileSync(file, content);
console.log('Patched catalog-data.ts');
