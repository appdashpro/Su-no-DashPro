const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');
code = code.replace(
  "              <Tooltip ",
  "              <Tooltip cursor={{ stroke: '#cbd5e1' }} "
);
fs.writeFileSync('src/components/Dashboard.tsx', code);
console.log('patched dashboard');
