const fs = require('fs');
const file = 'src/styles/form-hybrid.css';
let content = fs.readFileSync(file, 'utf8');

// Change unselected background for variant-copy and simple-variant-copy to #F8FAFC
content = content.replace(/\.variant-copy {\n  display: flex;\n  gap: 0\.65rem;\n  padding: 0\.65rem 0\.85rem;\n  border: 1px solid #E5E5E5;\n  background: #fff;/g,
  '.variant-copy {\n  display: flex;\n  gap: 0.65rem;\n  padding: 0.65rem 0.85rem;\n  border: 1px solid #E5E5E5;\n  background: #F8FAFC;');

content = content.replace(/\.simple-variant-copy {\n  padding: 0\.72rem 0\.85rem;\n  border: 1px solid #E5E5E5;\n  border-radius: 0\.7rem;\n  background: #ffffff;/g,
  '.simple-variant-copy {\n  padding: 0.72rem 0.85rem;\n  border: 1px solid #E5E5E5;\n  border-radius: 0.7rem;\n  background: #F8FAFC;');

// Change selected background to #FFF0ED
content = content.replace(/\.variant-option input:checked \+ \.variant-copy {\n  border-color: #EE4D2D;\n  background: #ffffff;/g,
  '.variant-option input:checked + .variant-copy {\n  border-color: #EE4D2D;\n  background: #FFF0ED;');

content = content.replace(/\.simple-variant-option input:checked \+ \.simple-variant-copy {\n  border-color: #EE4D2D;\n  background: #ffffff;/g,
  '.simple-variant-option input:checked + .simple-variant-copy {\n  border-color: #EE4D2D;\n  background: #FFF0ED;');

fs.writeFileSync(file, content);
console.log('Updated variant backgrounds.');
