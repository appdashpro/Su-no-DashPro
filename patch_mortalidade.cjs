const fs = require('fs');
let code = fs.readFileSync('src/lib/storage.ts', 'utf-8');

code = code.replace(
    /mortalidade: parseFloatSafe\(getCol\(row, 'Mortalidade'\)\),/g,
    ""
);

code = code.replace(
    /'Mortalidade': toNum\(v\.mortalidade\),/g,
    ""
);

fs.writeFileSync('src/lib/storage.ts', code);

let appCode = fs.readFileSync('src/App.tsx', 'utf-8');
appCode = appCode.replace(/\\nALTER TABLE registros ADD COLUMN IF NOT EXISTS "Mortalidade" numeric;/g, "");
fs.writeFileSync('src/App.tsx', appCode);

console.log('patched');
