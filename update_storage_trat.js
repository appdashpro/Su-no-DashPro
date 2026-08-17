import fs from 'fs';

let filePath = 'src/lib/storage.ts';
let code = fs.readFileSync(filePath, 'utf8');

// Update when saving to Supabase
code = code.replace(
  "carencia_dias: t.carenciaDias || null",
  "carencia_dias: t.carenciaDias || null,\n            motivo: t.motivo || null,\n            concentracao: t.concentracao || null"
);

// Update when pulling from Supabase
code = code.replace(
  "carenciaDias: t.carencia_dias",
  "carenciaDias: t.carencia_dias,\n             motivo: t.motivo,\n             concentracao: t.concentracao"
);

fs.writeFileSync(filePath, code);
