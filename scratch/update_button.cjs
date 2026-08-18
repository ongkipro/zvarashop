const fs = require('fs');

const classOld = 'w-full sm:w-auto min-w-[200px] border border-gray-300 bg-white py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none';
const classNew = 'inline-flex w-full sm:w-auto min-w-[200px] items-center justify-center rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#EE4D2D] focus:ring-offset-1 active:scale-[0.98]';

['src/components/home/ProductsSection.astro', 'src/pages/produk/index.astro'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(classOld, classNew);
  fs.writeFileSync(file, content);
});

console.log('Updated load-more buttons.');
