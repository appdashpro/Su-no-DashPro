const fs = require('fs');
let code = fs.readFileSync('src/lib/storage.ts', 'utf8');

code = code.replace(
  "pesoEstimadoKg: t.peso_estimado_kg",
  "pesoEstimadoKg: t.peso_estimado_kg !== null ? Number(t.peso_estimado_kg) : undefined"
);

fs.writeFileSync('src/lib/storage.ts', code);
