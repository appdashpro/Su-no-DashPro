import fs from 'fs';
let content = fs.readFileSync('src/components/Integrados.tsx', 'utf-8');
content = content.replace(
  "generateConsolidadoLotesPDF(selected, selectedVisits, configs);",
  "generateConsolidadoLotesPDF(selected, selectedVisits, configs, empresas);"
);
fs.writeFileSync('src/components/Integrados.tsx', content);
