const fs = require('fs');
let code = fs.readFileSync('src/components/EmpresaConfigGestao.tsx', 'utf8');
console.log(code.includes('setGompertzParams('));
