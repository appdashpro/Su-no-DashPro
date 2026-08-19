const fs = require('fs');
let file = 'src/lib/storage.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  "concentracao: t.concentracao || null,\n            peso_estimado_kg: v.pesoAmostradoKg || null",
  "concentracao: t.concentracao || null"
);

fs.writeFileSync(file, code);
