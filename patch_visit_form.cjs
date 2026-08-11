const fs = require('fs');
let code = fs.readFileSync('src/components/VisitForm.tsx', 'utf-8');
code = code.replace(
  "<Tooltip contentStyle",
  "<Tooltip cursor={{ stroke: '#cbd5e1' }} contentStyle"
);
fs.writeFileSync('src/components/VisitForm.tsx', code);
console.log('patched visitform');
