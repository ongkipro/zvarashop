const fs = require('fs');
const file = 'src/styles/form-hybrid.css';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/\.info-box {\s*display: grid;\s*gap: 0\.2rem;\s*padding: 0\.88rem 0\.95rem;\s*border: 1px solid #EE4D2D;/g, 
  '.info-box {\n  display: grid;\n  gap: 0.2rem;\n  padding: 0.88rem 0.95rem;\n  border: 1px solid #E5E5E5;');

content = content.replace(/\.info-box span {\s*font-size: 0\.74rem;\s*line-height: 1\.55;\s*font-weight: 500;\s*color: #8A704F;/g, 
  '.info-box span {\n  font-size: 0.74rem;\n  line-height: 1.55;\n  font-weight: 500;\n  color: #555555;');

fs.writeFileSync(file, content);
console.log('Updated info-box styles.');
