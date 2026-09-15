const fs = require('fs');
let file;

file = 'src/components/EmpresaConfigGestao.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/pm: parseFloat\(e.target.value\) \|\| 0/g, 'pm: parseFloat(e.target.value) || 0');
fs.writeFileSync(file, content);

console.log('Fixed');
