const fs = require('fs');
const file = 'src/components/home/ProductsSection.astro';
let content = fs.readFileSync(file, 'utf8');

// Replace the aggressive left-border header with a cleaner title block
content = content.replace(/<div class="mb-4 bg-white p-4 shadow-sm border-l-4 border-\[#EE4D2D\]">[\s\S]*?<\/div>/, 
`<div class="mb-4 flex items-end justify-between px-1">
    <div>
      <h2 class="text-xl font-extrabold tracking-tight text-slate-900">{heading.title}</h2>
      <p class="mt-1 text-sm text-slate-500">{heading.description}</p>
    </div>
  </div>`);

// Give search input a rounded-lg look to match the new UI
content = content.replace(/class="w-full rounded-sm border border-gray-200/g, 'class="w-full rounded-xl border border-slate-200');

fs.writeFileSync(file, content);
console.log('Updated homepage UI in ProductsSection.');
