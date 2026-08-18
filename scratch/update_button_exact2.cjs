const fs = require('fs');

const classNew = 'inline-flex min-h-11 w-full items-center justify-center rounded-none border border-[#111111] bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-[#111111] shadow-2xs hover:bg-[#111111] hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C5A880]';

['src/components/home/ProductsSection.astro', 'src/pages/produk/index.astro'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/class="inline-flex min-h-11 w-full items-center justify-center rounded-none border border-\[#EE4D2D\] bg-white px-6 py-2\.5 text-xs font-bold uppercase tracking-wider text-\[#EE4D2D\] shadow-2xs hover:bg-\[#EE4D2D\] hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-\[#EE4D2D\]"/g, `class="${classNew}"`);
  fs.writeFileSync(file, content);
});

console.log('Updated load-more buttons to exact match black.');
