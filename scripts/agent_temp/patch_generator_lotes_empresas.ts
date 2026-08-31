import fs from 'fs';
let content = fs.readFileSync('src/reports/pdfGenerator.ts', 'utf-8');
content = content.replace(
  "const summaryDoc = getConsolidatedLotesTemplate(selectedLotes, selectedVisits, configs);",
  "const summaryDoc = getConsolidatedLotesTemplate(selectedLotes, selectedVisits, configs, empresas);"
);
fs.writeFileSync('src/reports/pdfGenerator.ts', content);
