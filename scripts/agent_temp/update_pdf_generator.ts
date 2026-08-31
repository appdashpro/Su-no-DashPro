import fs from 'fs';

const filePath = 'src/reports/pdfGenerator.ts';
let content = fs.readFileSync(filePath, 'utf-8');

// Signature of generateConsolidadoPDF
const sigRegex = /export const generateConsolidadoPDF = \(\n  visits: Visit\[\],\n  integrados: Integrado\[\],\n  empresas: Empresa\[\]\n\) => \{/;
const newSig = `export const generateConsolidadoPDF = (
  visits: Visit[],
  integrados: Integrado[],
  empresas: Empresa[],
  configs: any[],
  allVisits: Visit[]
) => {`;
content = content.replace(sigRegex, newSig);

// Call of getConsolidatedVisitsTemplate inside generateConsolidadoPDF
content = content.replace(/getConsolidatedVisitsTemplate\(visits, integrados, empresas\);/g, 'getConsolidatedVisitsTemplate(visits, integrados, empresas, configs, allVisits);');

// Call of getConsolidatedVisitsTemplate inside generateConsolidadoCompletePDF
content = content.replace(/getConsolidatedVisitsTemplate\(selectedVisits, integrados, empresas\);/g, 'getConsolidatedVisitsTemplate(selectedVisits, integrados, empresas, configs, allVisits);');

fs.writeFileSync(filePath, content);
