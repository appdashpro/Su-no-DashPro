import fs from 'fs';

const newCode = `import { TDocumentDefinitions, Content, TableCell } from 'pdfmake/interfaces';
import { Integrado, Visit, Empresa } from '../../types';
import { pdfStyles, defaultStyle, pdfLayouts } from '../pdfStyles';

export const getConsolidatedLotesTemplate = (
  selectedLotes: Integrado[],
  selectedVisits: Visit[],
  configs: any[],
  empresas?: Empresa[]
): TDocumentDefinitions => {
  const currentDate = new Date().toLocaleDateString('pt-BR');

  // Calculate global KPIs
  const totalLotes = selectedLotes.length;
  let totalAlojados = 0;
  let totalMortos = 0;
  let totalIdade = 0;
  let lotesEmAlerta = 0;
  
  selectedLotes.forEach(l => {
    const loteVisits = selectedVisits.filter(v => v.integradoId === l.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const lastVisit = loteVisits[0];
    const alojados = lastVisit?.animaisAlojados || 0;
    const mortos = lastVisit?.animaisMortos || 0;
    
    totalAlojados += alojados;
    totalMortos += mortos;
    if (lastVisit?.idade) totalIdade += lastVisit.idade;
    
    // Check Status Sanitário
    const ev = lastVisit?.avaliacao_tecnica;
    if (ev && (ev.suinos?.tosse === 1 || ev.suinos?.diarreia === 1 || ev.suinos?.canibalismo === 1 || ev.granja?.limpeza_baias === 1)) {
      lotesEmAlerta++;
    }
  });

  const mortGlobal = totalAlojados > 0 ? ((totalMortos / totalAlojados) * 100).toFixed(2) : '-';
  const idadeMedia = totalLotes > 0 ? Math.round(totalIdade / totalLotes) : 0;

  // Lotes ranking body
  const tableBody: TableCell[][] = [
    [
      { text: 'Nº Lote', style: 'tableHeader' },
      { text: 'Empresa', style: 'tableHeader' },
      { text: 'Produtor', style: 'tableHeader' },
      { text: 'Idade', style: 'tableHeader', alignment: 'center' },
      { text: 'Mortalidade', style: 'tableHeader', alignment: 'center' },
      { text: 'Status Sanit.', style: 'tableHeader', alignment: 'center' }
    ]
  ];

  if (selectedLotes.length > 0) {
    selectedLotes.forEach((l, index) => {
      const loteVisits = selectedVisits.filter(v => v.integradoId === l.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const lastVisit = loteVisits[0];
      
      const empresaName = empresas?.find(e => e.id === l.empresaId)?.nome || '-';
      
      const alojados = lastVisit?.animaisAlojados || 0;
      const mortos = lastVisit?.animaisMortos || 0;
      const mortPercent = alojados > 0 ? ((mortos / alojados) * 100).toFixed(2) + '%' : '-';
      
      // Simplistic sanit status
      const ev = lastVisit?.avaliacao_tecnica;
      let sanitStatus = 'Normal';
      let sanitColor = '#10b981';
      let isAlerta = false;
      if (ev && (ev.suinos?.tosse === 1 || ev.suinos?.diarreia === 1 || ev.suinos?.canibalismo === 1 || ev.granja?.limpeza_baias === 1)) {
        sanitStatus = 'Alerta';
        sanitColor = '#ef4444';
        isAlerta = true;
      }
  
      const fillColor = index % 2 === 0 ? '#f8fafc' : '#ffffff';
  
      tableBody.push([
        { text: l.loteNumber || '-', style: 'tableCell', fillColor },
        { text: empresaName, style: 'tableCell', fillColor },
        { text: l.name, style: 'tableCell', fillColor },
        { text: lastVisit?.idade ? \`\${lastVisit.idade}d\` : '-', style: 'tableCell', alignment: 'center', fillColor },
        { text: mortPercent, style: 'tableCell', alignment: 'center', fillColor },
        { text: sanitStatus, style: 'tableCell', color: sanitColor, alignment: 'center', bold: isAlerta, fillColor }
      ]);
    });
  } else {
    tableBody.push([
      { text: 'Nenhum lote selecionado.', colSpan: 6, style: 'tableCell', alignment: 'center', fillColor: '#f8fafc' },
      {}, {}, {}, {}, {}
    ]);
  }

  const content: Content[] = [
    {
      columns: [
        {
          width: '*',
          stack: [
            { text: 'DASHPRO', style: 'header' },
            { text: 'RELATÓRIO CONSOLIDADO DE LOTES', style: 'subheader' }
          ]
        },
        {
          width: 'auto',
          stack: [
            { text: \`Emissão: \${currentDate}\`, fontSize: 10, alignment: 'right' },
            { text: \`Lotes Selecionados: \${totalLotes}\`, fontSize: 10, bold: true, alignment: 'right', margin: [0, 4, 0, 0] }
          ]
        }
      ],
      margin: [0, 0, 0, 10]
    },
    { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 2, lineColor: '#0f172a' }], margin: [0, 0, 0, 20] },
    
    // KPIs Grid
    {
      table: {
        widths: ['*', '*', '*', '*'],
        body: [
          [
            { stack: [{ text: 'TOTAL DE LOTES', style: 'metricCardTitle' }, { text: \`\${totalLotes}\`, style: 'metricCardValue' }, { text: 'Avaliados', fontSize: 8, color: '#64748b', alignment: 'center' }], fillColor: '#f8fafc', margin: [8, 10, 8, 10], border: [false, false, false, false] },
            { stack: [{ text: 'ALOJAMENTO GLOBAL', style: 'metricCardTitle' }, { text: \`\${totalAlojados.toLocaleString('pt-BR')}\`, style: 'metricCardValue' }, { text: 'Suínos no período', fontSize: 8, color: '#64748b', alignment: 'center' }], fillColor: '#f8fafc', margin: [8, 10, 8, 10], border: [false, false, false, false] },
            { stack: [{ text: 'MORTALIDADE MÉDIA', style: 'metricCardTitle' }, { text: \`\${mortGlobal}%\`, style: 'metricCardValue' }, { text: 'Acumulada', fontSize: 8, color: '#64748b', alignment: 'center' }], fillColor: '#f8fafc', margin: [8, 10, 8, 10], border: [false, false, false, false] },
            { stack: [{ text: 'LOTES EM ALERTA', style: 'metricCardTitle' }, { text: \`\${lotesEmAlerta}\`, style: 'metricCardValue', color: lotesEmAlerta > 0 ? '#ef4444' : '#0f172a' }, { text: 'Score sanitário 1', fontSize: 8, color: '#64748b', alignment: 'center' }], fillColor: '#f8fafc', margin: [8, 10, 8, 10], border: [false, false, false, false] }
          ]
        ]
      },
      layout: 'noBorders',
      margin: [0, 0, 0, 30]
    },

    { text: 'RANKING / DETALHAMENTO DE LOTES', style: 'sectionTitle' },
    {
      table: {
        headerRows: 1,
        widths: ['auto', '*', '*', 'auto', 'auto', 'auto'],
        body: tableBody
      },
      layout: pdfLayouts.customLayout,
      margin: [0, 0, 0, 20]
    }
  ];

  return {
    pageSize: 'A4',
    pageOrientation: 'portrait',
    pageMargins: [30, 30, 30, 40],
    styles: pdfStyles,
    defaultStyle: defaultStyle,
    info: {
      title: 'Relatório Consolidado de Lotes',
      author: 'Suíno DashPro'
    },
    footer: (currentPage: number, pageCount: number) => {
      return {
        columns: [
          { text: 'Gerado por DashPro - Confidencial', style: 'footer', margin: [40, 0, 0, 0] },
          { text: \`Página \${currentPage} de \${pageCount}\`, style: 'footer', alignment: 'right', margin: [0, 0, 40, 0] }
        ]
      };
    },
    content: content
  };
};
`;

fs.writeFileSync('src/reports/templates/ConsolidatedLotesReport.ts', newCode);

