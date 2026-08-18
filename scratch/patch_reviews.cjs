const fs = require('fs');
const file = 'src/lib/catalog-data.ts';
let content = fs.readFileSync(file, 'utf8');

const replacement = `        ...(presentation?.soldCount !== undefined
          ? { soldCount: presentation.soldCount }
          : { soldCount: pseudoSold }),
        reviews: presentation?.reviews?.length ? presentation.reviews : [
          { name: "Siti K.", location: "Jakarta Selatan", avatar: "", verified: true, date: "1 minggu lalu", comment: "Barang bagus, sesuai dengan deskripsi. Pengiriman juga cepat.", rating: 5 },
          { name: "Budi R.", location: "Bandung", avatar: "", verified: true, date: "2 minggu lalu", comment: "Kualitas mantap, harga bersahabat. Recommended seller!", rating: 5 },
          { name: "Andi S.", location: "Surabaya", avatar: "", verified: true, date: "1 bulan lalu", comment: "Sangat berguna dan berfungsi dengan baik. Terima kasih.", rating: 4 }
        ],`;

content = content.replace(/        \.\.\.\(presentation\?\.soldCount !== undefined\s*\?\s*\{ soldCount: presentation\.soldCount \}\s*:\s*\{ soldCount: pseudoSold \}\),\s*reviews: presentation\?\.reviews \|\| \[\],/, replacement);

if (content.includes("Siti K.")) {
  fs.writeFileSync(file, content);
  console.log("Reviews patched successfully.");
} else {
  console.error("Failed to patch reviews.");
}
