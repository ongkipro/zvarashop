const fs = require('fs');
const file = 'src/components/home/ProductsSection.astro';
let content = fs.readFileSync(file, 'utf8');

// Remove heading block
content = content.replace(/<div class="mb-4 flex items-end justify-between px-1">\s*<div>\s*<h2[^>]*>\{heading\.title\}<\/h2>\s*<p[^>]*>\{heading\.description\}<\/p>\s*<\/div>\s*<\/div>/g, '');

// Remove search block
content = content.replace(/<div class="mb-4" hidden=\{products\.length === 0\}>\s*<div class="relative w-full shadow-sm">\s*<input[^>]+id="catalog-search"[^>]*\/>\s*<Icon[^>]*\/>\s*<\/div>\s*<\/div>/g, '');

fs.writeFileSync(file, content);
console.log('Removed heading and search from ProductsSection.');
