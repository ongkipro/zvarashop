const fs = require('fs');
const file = 'src/styles/form-hybrid.css';
let content = fs.readFileSync(file, 'utf8');

// Change input backgrounds to a light gray
content = content.replace(/background:\s*#ffffff;/g, 'background: #F8FAFC;');

// But keep the focus background white so it pops
content = content.replace(/background:\s*#F8FAFC;\s*\n\s*box-shadow:/g, 'background: #ffffff;\n  box-shadow:');

// Change the intense #EE4D2D borders on inputs to a thinner/lighter orange
// First, find border-color: #EE4D2D; and replace with a lighter orange #FF9E80
// Wait, we only want to change it for the focus and valid fields, not the buttons.
// Actually, earlier I replaced #111111 with #EE4D2D globally for borders.
// Let's change the focus and valid field styles specifically.

content = content.replace(/\.form-field input:focus,[\s\S]*?box-shadow: 0 0 0 2px rgba\(197, 168, 128, 0\.3\) !important;/g, 
  '.form-field input:focus,\n.form-field textarea:focus {\n  outline: none;\n  border-color: #FF9E80;\n  background: #ffffff;\n  box-shadow: 0 0 0 3px rgba(238, 77, 45, 0.15) !important;');

content = content.replace(/\.field-grid input\.field-valid:focus,[\s\S]*?box-shadow: 0 0 0 2px rgba\(197, 168, 128, 0\.3\) !important;/g, 
  '.field-grid input.field-valid:focus,\n.field-grid textarea.field-valid:focus,\n.form-field input.field-valid:focus,\n.form-field textarea.field-valid:focus {\n  border-color: #FF9E80 !important;\n  background: #ffffff !important;\n  box-shadow: 0 0 0 3px rgba(238, 77, 45, 0.15) !important;');

content = content.replace(/\.field-grid input\.field-valid,\n\.field-grid textarea\.field-valid,\n\.form-field input\.field-valid,\n\.form-field textarea\.field-valid {\n  border-color: #EE4D2D;/g,
  '.field-grid input.field-valid,\n.field-grid textarea.field-valid,\n.form-field input.field-valid,\n.form-field textarea.field-valid {\n  border-color: #FF9E80;');

fs.writeFileSync(file, content);
console.log('Updated form css for input backgrounds and borders.');
