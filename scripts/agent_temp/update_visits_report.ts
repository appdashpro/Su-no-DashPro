import fs from 'fs';

const filePath = 'src/reports/templates/ConsolidatedVisitsReport.ts';
let content = `import { TDocumentDefinitions, Content, TableCell } from 'pdfmake/interfaces';
import { Visit, Integrado, Empresa } from '../../types';
import { pdfStyles, defaultStyle, pdfLayouts } from '../pdfStyles';
import { getExpectedConsumption } from '../../lib/expectedConsumption';
import { formatDate } from '../../utils/dateUtils';

export const getConsolidatedVisitsTemplate = (
  visits: Visit[],
  integrados: Integrado[],
  empresas: Empresa[],
  configs: any[],
  allVisits: Visit[]
): TDocumentDefinitions => {
  const currentDate = new Date().toLocaleDateString('pt-BR');
  let totalTratamentos = 0;
  let totalComProblemas = 0;

  const tableRows = visits.map(v => {
    const integrado = integrados.find(i => i.id === v.integradoId);
    const empresaName = empresas.find(e => e.id === integrado?.empresaId)?.name || '';
    const produtor = integrado?.name || '-';
    
    // Simplistic problem check & Sanidade score
    const ev = v.avaliacao_tecnica;
    let hasProblem = false;
    let sanitIndex = 100;
    let sanitColor = '#10b981';
    let sanitText = '-';

    const parseScore = (s?: number) => { if(!s) return 0; if(s===1) return 3; if(s===2) return 2; if(s===3) return 1; return 0; };
    const validScores: {score: number}[] = [];
    if (ev) {
      if (ev.suinos?.diarreia) validScores.push({score: parseScore(ev.suinos.diarreia)});
      if (ev.suinos?.tosse) validScores.push({score: parseScore(ev.suinos.tosse)});
      if (ev.suinos?.mortalidade) validScores.push({score: parseScore(ev.suinos.mortalidade)});
      if (ev.suinos?.refugos) validScores.push({score: parseScore(ev.suinos.refugos)});
      if (ev.suinos?.canibalismo) validScores.push({score: parseScore(ev.suinos.canibalismo)});
      if (ev.granja?.limpeza_baias) validScores.push({score: parseScore(ev.granja.limpeza_baias)});
      if (ev.granja?.cortinas) validScores.push({score: parseScore(ev.granja.cortinas)});
      if (ev.granja?.qualidade_ar) validScores.push({score: parseScore(ev.granja.qualidade_ar)});
      if (ev.bebedouros?.vazamento) validScores.push({score: parseScore(ev.bebedouros.vazamento)});
      if (ev.bebedouros?.pressao_agua) validScores.push({score: parseScore(ev.bebedouros.pressao_agua)});
      if (ev.comedouros?.regulagem) validScores.push({score: parseScore(ev.comedouros.regulagem)});

      if (validScores.length > 0) {
        const totalMax = validScores.length * 3;
        const currentScore = validScores.reduce((acc, curr) => acc + curr.score, 0);
        sanitIndex = Math.round((currentScore / totalMax) * 100);
      }
      
      if (ev.suinos?.tosse === 1 || ev.suinos?.diarreia === 1 || ev.suinos?.canibalismo === 1 || ev.granja?.limpeza_baias === 1) {
        hasProblem = true;
      }
    }
    
    if (sanitIndex >= 85) {
      sanitColor = '#10b981'; // Green
    } else if (sanitIndex >= 65) {
      sanitColor = '#f59e0b'; // Amber
    } else {
      sanitColor = '#ef4444'; // Red
    }
    sanitText = \`\${sanitIndex}%\`;
    
    if (hasProblem) totalComProblemas++;

    const numTrats = v.tratamentos ? v.tratamentos.length : 0;
    if (numTrats > 0) totalTratamentos += numTrats;
    
    // Calculations for Mortality & Consumption
    const loteVisitas = allVisits.filter(av => av.integradoId === v.integradoId).sort((a, b) => (a.idade || 0) - (b.idade || 0));
    const alojados = v.animaisAlojados || loteVisitas[0]?.animaisAlojados || 0;
    const mortos = v.animaisMortos || 0;
    const mortPercentNum = alojados > 0 ? ((mortos / alojados) * 100) : 0;
    const mortPercent = alojados > 0 ? mortPercentNum.toFixed(2) + '%' : '-';
    
    const targetAge = v.idade || 0;
    const currentConfig = configs.find(c => c.empresa_id === integrado?.empresaId);
    
    const finalMetaMortalidade = currentConfig?.meta_mortalidade !== undefined && currentConfig?.meta_mortalidade !== null ? currentConfig.meta_mortalidade : 3;
    const propMetaMortalidade = targetAge ? Number(((Math.min(targetAge, 105) / 105) * finalMetaMortalidade).toFixed(2)) : finalMetaMortalidade;
    const isMortAlerta = mortPercentNum > propMetaMortalidade;
    const mortColor = isMortAlerta ? '#ef4444' : '#10b981';

    const latestCurveDate = currentConfig?.curva_desempenho && currentConfig.curva_desempenho.length > 0 
      ? [...currentConfig.curva_desempenho].sort((a: any, b: any) => (a.dataVigencia || "").localeCompare(b.dataVigencia || ""))[currentConfig.curva_desempenho.length - 1].dataVigencia 
      : undefined;

    const consumoEsperado = targetAge > 0
      ? getExpectedConsumption(targetAge, v.tipoLote, v.pesoAloj, integrado?.alojamentoDate, integrado?.status, integrado?.fechamentoDate, currentConfig, undefined, latestCurveDate)
      : null;

    const descartes = v.descartesPeriodo || 0;
    const vivos = Math.max(0, alojados - mortos - descartes);
    const totalRacao = v.volumeTotalCargas || 0;
    const consumoRealCab = v.consumoAcumuladoReal !== undefined && v.consumoAcumuladoReal !== null
      ? Number(v.consumoAcumuladoReal)
      : (totalRacao > 0 && vivos > 0 ? Number((totalRacao / vivos).toFixed(2)) : undefined);
        
    const errorRate = (consumoRealCab !== undefined && consumoEsperado && consumoEsperado > 0) ? Math.abs(consumoRealCab - consumoEsperado) / consumoEsperado : null;
    
    let consMetaColor = '#334155';
    let consMetaBold = false;
    if (consumoRealCab !== undefined && consumoEsperado !== null) {
      const realDiff = consumoRealCab - consumoEsperado;
      if (Math.abs(realDiff) <= 5) {
        consMetaColor = '#3b82f6'; // Blue
      } else if (realDiff < -5) {
        consMetaColor = '#10b981'; // Green
        consMetaBold = true;
      } else {
        consMetaColor = '#ef4444'; // Red
        consMetaBold = true;
      }
    }
    const curveAccuracy = errorRate !== null ? Math.max(0, 100 - (errorRate * 100)) : null;
    const accuracyColor = curveAccuracy === null ? '#334155' : (curveAccuracy >= 90 ? '#10b981' : '#ef4444');

    return {
      lote: integrado?.loteNumber || '-',
      empresaProdutor: \`\${empresaName} - \${produtor}\`,
      visitaLabel: \`\${formatDate(v.date)} (\${targetAge}d) | \${v.colaborador || '-'}\`,
      mortPercent,
      mortColor,
      isMortAlerta,
      consumoRealCab,
      consumoEsperado,
      consMetaColor,
      consMetaBold,
      curveAccuracy,
      accuracyColor,
      hasTreatments: numTrats > 0 ? 'Sim' : 'Não',
      treatmentsColor: numTrats > 0 ? '#ef4444' : '#10b981',
      sanitText,
      sanitColor
    };
  });

  const tableBody: TableCell[][] = [
    [
      { text: 'Nº Lote', style: 'tableHeader' },
      { text: 'Empresa / Produtor', style: 'tableHeader' },
      { text: 'Visita', style: 'tableHeader' },
      { text: 'Mort.', style: 'tableHeader', alignment: 'center' },
      { text: 'Cons./Meta', style: 'tableHeader', alignment: 'center' },
      { text: 'Aderência', style: 'tableHeader', alignment: 'center' },
      { text: 'Tratam.', style: 'tableHeader', alignment: 'center' },
      { text: 'Sanidade', style: 'tableHeader', alignment: 'center' }
    ]
  ];

  if (tableRows.length > 0) {
    tableRows.forEach((row, i) => {
      const fillColor = i % 2 === 0 ? '#f8fafc' : '#ffffff';
      tableBody.push([
        { text: row.lote, style: 'tableCell', fontSize: 8, fillColor },
        { text: row.empresaProdutor, style: 'tableCell', fontSize: 8, fillColor },
        { text: row.visitaLabel, style: 'tableCell', fontSize: 8, fillColor },
        { text: row.mortPercent, style: 'tableCell', fontSize: 8, alignment: 'center', color: row.mortColor, bold: row.isMortAlerta, fillColor },
        { text: (row.consumoRealCab !== undefined && row.consumoEsperado !== null) ? \`\${row.consumoRealCab.toFixed(1)} / \${row.consumoEsperado.toFixed(1)}\` : '-', style: 'tableCell', fontSize: 8, alignment: 'center', color: row.consMetaColor, bold: row.consMetaBold, fillColor },
        { text: row.curveAccuracy !== null ? \`\${Math.round(row.curveAccuracy)}%\` : '-', style: 'tableCell', fontSize: 8, alignment: 'center', color: row.accuracyColor, bold: row.curveAccuracy !== null && row.curveAccuracy < 90, fillColor },
        { text: row.hasTreatments, style: 'tableCell', fontSize: 8, alignment: 'center', bold: row.hasTreatments === 'Sim', color: row.treatmentsColor, fillColor },
        { text: row.sanitText, style: 'tableCell', fontSize: 8, color: row.sanitColor, alignment: 'center', bold: true, fillColor }
      ]);
    });
  } else {
    tableBody.push([
      { text: 'Nenhuma visita encontrada no período.', colSpan: 8, style: 'tableCell', alignment: 'center', fillColor: '#f8fafc' },
      {}, {}, {}, {}, {}, {}, {}
    ]);
  }

  const content: Content[] = [
    {
      columns: [
        {
          width: '*',
          stack: [
            { text: 'DASHPRO', style: 'header' },
            { text: 'RELATÓRIO CONSOLIDADO DE VISITAS', style: 'subheader' }
          ]
        },
        {
          width: 'auto',
          stack: [
            { text: \`Emissão: \${currentDate}\`, fontSize: 10, alignment: 'right' },
            { text: \`Total de Visitas: \${visits.length}\`, fontSize: 10, bold: true, alignment: 'right', margin: [0, 4, 0, 0] }
          ]
        }
      ],
      margin: [0, 0, 0, 10]
    },
    { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 2, lineColor: '#0f172a' }], margin: [0, 0, 0, 20] },
    
    // KPIs Grid
    {
      table: {
        widths: ['*', '*', '*'],
        body: [
          [
            { stack: [{ text: 'TOTAL DE VISITAS', style: 'metricCardTitle' }, { text: \`\${visits.length}\`, style: 'metricCardValue' }, { text: 'No período filtrado', fontSize: 8, color: '#64748b', alignment: 'center' }], fillColor: '#f8fafc', margin: [8, 10, 8, 10], border: [false, false, false, false] },
            { stack: [{ text: 'GRANJAS EM ALERTA', style: 'metricCardTitle' }, { text: \`\${totalComProblemas}\`, style: 'metricCardValue' }, { text: 'Score 1 registrado', fontSize: 8, color: '#64748b', alignment: 'center' }], fillColor: '#f8fafc', margin: [8, 10, 8, 10], border: [false, false, false, false] },
            { stack: [{ text: 'TRATAMENTOS PRESCRITOS', style: 'metricCardTitle' }, { text: \`\${totalTratamentos}\`, style: 'metricCardValue' }, { text: 'Volume de medicação', fontSize: 8, color: '#64748b', alignment: 'center' }], fillColor: '#f8fafc', margin: [8, 10, 8, 10], border: [false, false, false, false] }
          ]
        ]
      },
      layout: 'noBorders',
      margin: [0, 0, 0, 30]
    },

    { text: 'DETALHAMENTO DE VISITAS', style: 'sectionTitle' },
    {
      table: {
        headerRows: 1,
        widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
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
      title: 'Relatório Consolidado de Visitas',
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

fs.writeFileSync(filePath, content);
