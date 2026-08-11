const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/"Tratamentos" jsonb/g, '"Tratamentos" text');

fs.writeFileSync('src/App.tsx', code);
console.log('patched app tratamentos');
