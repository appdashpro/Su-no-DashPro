const fs = require('fs');

// 1. types.ts
let typesStr = fs.readFileSync('src/types.ts', 'utf8');
typesStr = typesStr.replace(
  "  carenciaDias?: number;\n}",
  "  carenciaDias?: number;\n  pesoEstimadoKg?: number;\n}"
);
fs.writeFileSync('src/types.ts', typesStr);

// 2. storage.ts
let storageStr = fs.readFileSync('src/lib/storage.ts', 'utf8');
storageStr = storageStr.replace(
  "concentracao: t.concentracao\n          }))",
  "concentracao: t.concentracao,\n             pesoEstimadoKg: t.peso_estimado_kg\n          }))"
);
fs.writeFileSync('src/lib/storage.ts', storageStr);

// 3. MedicationAnalysis.tsx
let medStr = fs.readFileSync('src/components/MedicationAnalysis.tsx', 'utf8');
medStr = medStr.replace(
  "let pesoEstimadoKg = visit.pesoAmostradoKg || 0;",
  "let pesoEstimadoKg = t.pesoEstimadoKg || visit.pesoAmostradoKg || 0;"
);
// wait, the line "let pesoEstimadoKg =" is outside the t loop!
// let's adjust it!
