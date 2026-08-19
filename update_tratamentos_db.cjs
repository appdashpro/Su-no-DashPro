const fs = require('fs');

let file = 'src/lib/storage.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  "concentracao: t.concentracao || null",
  "concentracao: t.concentracao || null,\n            peso_estimado_kg: v.pesoAmostradoKg || null"
);

// We should also map it back when reading? Let's check where `tratamentos` is selected.
// In storage.ts around line 350:
// let tratamentos: Tratamento[] = ...
