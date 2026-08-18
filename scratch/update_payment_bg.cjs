const fs = require('fs');
const file = 'src/styles/form-hybrid.css';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/\.payment-option-copy {\s*display: flex;\s*align-items: center;\s*gap: 0\.65rem;\s*padding: 0\.6rem 0\.75rem;\s*border: 1px solid #E5E5E5;/g,
  '.payment-option-copy {\n  display: flex;\n  align-items: center;\n  gap: 0.65rem;\n  padding: 0.6rem 0.75rem;\n  border: 1px solid #E5E5E5;\n  background: #F8FAFC;');

content = content.replace(/\.payment-option:hover \.payment-option-copy,\n\.payment-option input:focus-visible \+ \.payment-option-copy {\n  border-color: #D8D6D0;\n  background: #ffffff;/g,
  '.payment-option:hover .payment-option-copy,\n.payment-option input:focus-visible + .payment-option-copy {\n  border-color: #D8D6D0;\n  background: #F8FAFC;');

content = content.replace(/\.payment-option input:checked \+ \.payment-option-copy {\n  border-color: #EE4D2D;\n  background: #ffffff;/g,
  '.payment-option input:checked + .payment-option-copy {\n  border-color: #EE4D2D;\n  background: #FFF0ED;');

content = content.replace(/\.payment-group {\n  border: 1px solid #E5E5E5;\n  border-radius: 0\.55rem;\n  background: #ffffff;/g,
  '.payment-group {\n  border: 1px solid #E5E5E5;\n  border-radius: 0.55rem;\n  background: #F8FAFC;');

content = content.replace(/\.payment-group\.is-selected {\n  border-color: #EE4D2D;\n  background: #ffffff;/g,
  '.payment-group.is-selected {\n  border-color: #EE4D2D;\n  background: #FFF0ED;');

content = content.replace(/\.payment-group-body \.payment-option:hover \.payment-option-copy {\n  background: #F8FAFC;\n}/g,
  '.payment-group-body .payment-option:hover .payment-option-copy {\n  background: #FFF0ED;\n}');

content = content.replace(/\.payment-group-body \.payment-option input:checked \+ \.payment-option-copy {\n  border: 0;\n  background: #F8FAFC;\n}/g,
  '.payment-group-body .payment-option input:checked + .payment-option-copy {\n  border: 0;\n  background: #FFF0ED;\n}');

fs.writeFileSync(file, content);
console.log('Updated payment backgrounds.');
