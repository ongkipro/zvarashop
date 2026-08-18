const fs = require('fs');
const file = 'src/styles/form-hybrid.css';
let content = fs.readFileSync(file, 'utf8');

// The primary button and accents use #111111 background and #C5A880 for hover/accents.
// Let's replace the submit button and radio accents with #EE4D2D
// and hover/loading states with #D73D22 (darker orange)

content = content.replace(/background:\s*#111111\s*!important;/g, 'background: #EE4D2D !important;');
content = content.replace(/border-color:\s*#111111;/g, 'border-color: #EE4D2D;');
content = content.replace(/border-color:\s*#111111\s*!important;/g, 'border-color: #EE4D2D !important;');
content = content.replace(/outline:\s*2px\s+solid\s+#111111;/g, 'outline: 2px solid #EE4D2D;');
content = content.replace(/border:\s*1px\s+solid\s+#111111;/g, 'border: 1px solid #EE4D2D;');
content = content.replace(/background-image:\s*linear-gradient\(135deg,\s*#111111\s*0%,\s*#1a1a1a\s*100%\)\s*!important;/g, 'background-image: linear-gradient(135deg, #EE4D2D 0%, #D73D22 100%) !important;');

// Radio button gradients currently use #C5A880
content = content.replace(/#C5A880/g, '#EE4D2D');

// Any explicit text color that is currently #111111 should be #222222 for a softer dark gray instead of pure black
content = content.replace(/color:\s*#111111;/g, 'color: #222222;');

fs.writeFileSync(file, content);
console.log('Updated form-hybrid.css');
