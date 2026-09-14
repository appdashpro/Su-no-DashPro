const fs = require('fs');
let code = fs.readFileSync('src/components/EmpresaConfigGestao.tsx', 'utf8');
code = code.replace('{config ? (', '{config && (');
fs.writeFileSync('src/components/EmpresaConfigGestao.tsx', code);
