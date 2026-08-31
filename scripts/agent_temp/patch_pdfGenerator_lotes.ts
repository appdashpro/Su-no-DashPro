import fs from 'fs';

let content = fs.readFileSync('src/reports/pdfGenerator.ts', 'utf-8');

const regex = /export const generateConsolidadoLotesPDF = \([\s\S]*?\};\n/m;
const newFunc = `
export const generateConsolidadoLotesPDF = (
  selectedLotes: Integrado[],
  selectedVisits: Visit[],
  configs: any[],
  empresas: Empresa[]
) => {
  try {
    const summaryDoc = getConsolidatedLotesTemplate(selectedLotes, selectedVisits, configs);
    let combinedContent: any[] = Array.isArray(summaryDoc.content) ? [...summaryDoc.content] : [summaryDoc.content];
    
    selectedLotes.forEach((lote) => {
      const empresa = empresas.find(e => e.id === lote.empresaId);
      const currentConfig = configs.find(c => c.empresa_id === lote.empresaId);
      const loteVisits = selectedVisits.filter(v => v.integradoId === lote.id).sort((a, b) => (a.idade || 0) - (b.idade || 0));
      
      const loteDoc = getLoteTemplate(lote, empresa, currentConfig, loteVisits);
      
      combinedContent.push({ text: '', pageBreak: 'before' });
      
      let lContent = Array.isArray(loteDoc.content) ? loteDoc.content : [loteDoc.content];
      combinedContent = combinedContent.concat(lContent);
    });
    
    const finalDoc: TDocumentDefinitions = {
      ...summaryDoc,
      content: combinedContent
    };
    
    const pdfDocGenerator = pdfMake.createPdf(finalDoc);
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    pdfDocGenerator.download(\`Consolidado_Lotes_\${dateStr}.pdf\`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Erro ao gerar o relatório PDF. Verifique o console para mais detalhes.');
  }
};
`;

content = content.replace(regex, newFunc);
fs.writeFileSync('src/reports/pdfGenerator.ts', content);

