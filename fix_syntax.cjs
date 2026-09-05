const fs = require('fs');
let code = fs.readFileSync('src/components/EmpresaConfigGestao.tsx', 'utf8');

code = code.replace("/>}", "");

fs.writeFileSync('src/components/EmpresaConfigGestao.tsx', code);
