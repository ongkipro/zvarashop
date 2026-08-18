const fs = require('fs');
const file = 'src/components/storefront/templates/CompactMarketHome.astro';
let content = fs.readFileSync(file, 'utf8');

// Remove import
content = content.replace(/import HeroSection from '\.\.\/\.\.\/home\/HeroSection\.astro';\n/g, '');

// Remove hero rendering
content = content.replace(/\{sections\.hero && <HeroSection[^>]+>\}[\n\s]*/g, '');

// Add h1 to top of main if missing
if (!content.includes('<h1 class="sr-only">')) {
  content = content.replace(/<main\n  id="konten-utama"\n  class="relative min-h-screen overflow-x-hidden bg-\[#F5F5F5\] font-sans text-\[#222222\] antialiased"\n>/g, '<main\n  id="konten-utama"\n  class="relative min-h-screen overflow-x-hidden bg-[#F5F5F5] font-sans text-[#222222] antialiased"\n>\n  <h1 class="sr-only">{content.hero.title || Astro.locals.tenant.name}</h1>');
}

fs.writeFileSync(file, content);
console.log('Removed HeroSection from CompactMarketHome.');
