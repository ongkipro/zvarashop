const fs = require('fs');
const file = 'src/pages/produk/[slug].astro';
let content = fs.readFileSync(file, 'utf8');

// Improve section styling for better UI/UX without changing the 1-column layout
content = content.replace(/class="mx-auto max-w-\[480px\] bg-\[#F5F5F5\] pb-20"/g, 'class="mx-auto max-w-[480px] bg-[#F5F5F5] pb-20 sm:pt-4 sm:pb-24"');

// Make the breadcrumb section rounded on desktop
content = content.replace(/<div class="bg-white">/g, '<div class="bg-white sm:rounded-t-xl sm:shadow-sm sm:ring-1 sm:ring-slate-100">');

// Make the gallery section look premium
content = content.replace(/class="border-b border-\[#E5E5E5\] bg-white p-3 sm:p-4 mb-2"/g, 'class="border-b border-slate-200 bg-white p-0 sm:p-4 mb-2 sm:mb-3 sm:rounded-b-xl sm:shadow-sm sm:ring-1 sm:ring-slate-100"');

// Make sections have nice rounded corners and shadows on desktop
content = content.replace(/class="border-b border-t border-\[#E5E5E5\] bg-white px-5 py-5 mb-2"/g, 'class="border-y border-slate-200 bg-white px-5 py-5 mb-2 sm:mb-3 sm:rounded-xl sm:border-x sm:shadow-sm sm:ring-1 sm:ring-slate-100"');
content = content.replace(/class="border-b border-t border-\[#E5E5E5\] bg-white px-5 py-6 mb-2"/g, 'class="border-y border-slate-200 bg-white px-5 py-6 mb-2 sm:mb-3 sm:rounded-xl sm:border-x sm:shadow-sm sm:ring-1 sm:ring-slate-100"');

// Fix the direct order form container
content = content.replace(/class="mt-4 scroll-mt-6 overflow-hidden rounded-none border border-\[#E5E5E5\] bg-white p-2"/g, 'class="mt-4 scroll-mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm p-3"');

// Remove border-t border-b specific tailwind classes when using border-y for cleaner look
content = content.replace(/border-t border-\[#E5E5E5\]/g, 'border-t border-slate-200');
content = content.replace(/border-b border-\[#E5E5E5\]/g, 'border-b border-slate-200');

fs.writeFileSync(file, content);
console.log('Updated slug.astro UI/UX');
