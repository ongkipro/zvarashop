const fs = require('fs');

const classNew = 'inline-flex min-h-11 w-full items-center justify-center rounded-none border border-[#EE4D2D] bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-[#EE4D2D] shadow-2xs hover:bg-[#EE4D2D] hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EE4D2D]';

['src/components/home/ProductsSection.astro', 'src/pages/produk/index.astro'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/class="inline-flex w-full sm:w-auto min-w-\[200px\] items-center justify-center rounded-xl border border-slate-200 bg-white py-2\.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-\[#EE4D2D\] focus:ring-offset-1 active:scale-\[0\.98\]"/g, `class="${classNew}"`);
  fs.writeFileSync(file, content);
});

console.log('Updated load-more buttons to exact match.');
