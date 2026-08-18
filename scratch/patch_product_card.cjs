const fs = require('fs');
const file = 'src/components/home/ProductsSection.astro';
let content = fs.readFileSync(file, 'utf8');

const target = `              <h3 class="line-clamp-2 min-h-10 text-[13px] font-medium leading-5 text-slate-800">
                {product.name}
              </h3>`;

const replacement = `              <h3 class="line-clamp-2 min-h-10 text-[13px] font-medium leading-5 text-slate-800">
                {product.name}
              </h3>
              {product.ratingValue && product.reviewCount && (
                <div class="mt-1 flex items-center gap-1">
                  <Icon name="lucide:star" class="h-3 w-3 fill-[#FEEA2E] text-[#FEEA2E]" aria-hidden="true" />
                  <span class="text-[11px] font-medium text-slate-600">{product.ratingValue.toFixed(1)}</span>
                  <span class="text-[10px] text-slate-400">({product.reviewCount})</span>
                </div>
              )}`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(file, content);
  console.log('Patched ProductsSection.astro to add rating.');
} else {
  console.log('Target string not found in ProductsSection.astro');
}
