import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { Visit, Integrado, Empresa } from '../types';
import { getVisitaTemplate } from './templates/VisitaReport';
import { getLoteTemplate } from './templates/LoteReport';
import { getConsolidatedVisitsTemplate } from './templates/ConsolidatedVisitsReport';
import { getConsolidatedLotesTemplate } from './templates/ConsolidatedLotesReport';

// Initialize virtual file system for fonts
const vfs = (pdfFonts as any)?.pdfMake?.vfs 
  || (pdfFonts as any)?.vfs 
  || (pdfFonts as any)?.default?.pdfMake?.vfs
  || (pdfFonts as any)?.default?.vfs
  || (pdfFonts as any)?.default
  || pdfFonts;

(pdfMake as any).vfs = vfs;

export const generateVisitaPDF = (
  visita: Visit,
  integrado: Integrado | null,
  empresa: Empresa | undefined,
  currentConfig: any,
  loteVisits: Visit[]
) => {
  try {
    const docDefinition: TDocumentDefinitions = getVisitaTemplate(visita, integrado, empresa, currentConfig, loteVisits);
    
    // Create and download the PDF
    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    
    // Naming the file based on date and producer
    const dateStr = visita.date.replace(/-/g, '');
    const prodName = integrado?.name ? integrado.name.replace(/\s+/g, '_') : 'Desconhecido';
    
    pdfDocGenerator.download(`Visita_${prodName}_${dateStr}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Erro ao gerar o relatório PDF. Verifique o console para mais detalhes.');
  }
};

export const generateLotePDF = (
  lote: Integrado,
  empresa: Empresa | undefined,
  currentConfig: any,
  loteVisits: Visit[]
) => {
  try {
    const docDefinition: TDocumentDefinitions = getLoteTemplate(
      lote, empresa, currentConfig, loteVisits
    );
    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    const prodName = lote.name.replace(/\s+/g, "_");
    pdfDocGenerator.download(`Lote_${prodName}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Erro ao gerar o relatório PDF. Verifique o console para mais detalhes.");
  }
};

export const generateConsolidadoPDF = (
  visits: Visit[],
  integrados: Integrado[],
  empresas: Empresa[],
  configs: any[],
  allVisits: Visit[]
) => {
  try {
    const docDefinition = getConsolidatedVisitsTemplate(visits, integrados, empresas, configs, allVisits);
    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    pdfDocGenerator.download(`Consolidado_Visitas_${dateStr}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Erro ao gerar o relatório PDF. Verifique o console para mais detalhes.');
  }
};


export const generateConsolidadoLotesPDF = (
  selectedLotes: Integrado[],
  selectedVisits: Visit[],
  configs: any[],
  empresas: Empresa[]
) => {
  try {
    const summaryDoc = getConsolidatedLotesTemplate(selectedLotes, selectedVisits, configs, empresas);
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
    pdfDocGenerator.download(`Consolidado_Lotes_${dateStr}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Erro ao gerar o relatório PDF. Verifique o console para mais detalhes.');
  }
};

export const generateConsolidadoCompletePDF = (
  selectedVisits: Visit[],
  integrados: Integrado[],
  empresas: Empresa[],
  configs: any[],
  allVisits: Visit[]
) => {
  try {
    // 1. Generate the Summary / Cover Page
    const summaryDoc = getConsolidatedVisitsTemplate(selectedVisits, integrados, empresas, configs, allVisits);
    let combinedContent: any[] = Array.isArray(summaryDoc.content) ? [...summaryDoc.content] : [summaryDoc.content];
    
    // 2. Append individual Visit reports
    selectedVisits.forEach((visita, index) => {
      const integrado = integrados.find(i => i.id === visita.integradoId) || null;
      const empresa = empresas.find(e => e.id === integrado?.empresaId);
      const currentConfig = configs.find(c => c.empresa_id === integrado?.empresaId);
      const loteVisits = allVisits.filter(v => v.integradoId === visita.integradoId).sort((a, b) => (a.idade || 0) - (b.idade || 0));
      
      const visitaDoc = getVisitaTemplate(visita, integrado, empresa, currentConfig, loteVisits);
      
      // Page break before each individual report
      combinedContent.push({ text: '', pageBreak: 'before' });
      
      let vContent = Array.isArray(visitaDoc.content) ? visitaDoc.content : [visitaDoc.content];
      
      combinedContent = combinedContent.concat(vContent);
    });
    
    const finalDoc: TDocumentDefinitions = {
      ...summaryDoc,
      content: combinedContent
    };
    
    const pdfDocGenerator = pdfMake.createPdf(finalDoc);
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    pdfDocGenerator.download(`Consolidado_Geral_${dateStr}.pdf`);
  } catch (error) {
    console.error('Error generating Complete PDF:', error);
    alert('Erro ao gerar o relatório PDF. Verifique o console para mais detalhes.');
  }
};
