import { TDocumentDefinitions, Content, TableCell } from 'pdfmake/interfaces';
import { Integrado, Visit, Empresa } from '../../types';
import { pdfStyles, defaultStyle, pdfLayouts } from '../pdfStyles';
import { getExpectedConsumption } from '../../data';

export const getConsolidatedLotesTemplate = (
  selectedLotes: Integrado[],
  selectedVisits: Visit[],
  configs: any[],
  empresas?: Empresa[]
): TDocumentDefinitions => {
  const currentDate = new Date().toLocaleDateString('pt-BR');
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
  };

  // Calculate global KPIs
  const totalLotes = selectedLotes.length;
  let totalAlojados = 0;
  let totalMortos = 0;
  let lotesEmAlerta = 0;
  
  selectedLotes.forEach(l => {
    const loteVisits = selectedVisits.filter(v => v.integradoId === l.id).sort((a,b) => (a.idade || 0) - (b.idade || 0));
    const lastVisit = loteVisits.length > 0 ? loteVisits[loteVisits.length - 1] : null;
    const alojados = lastVisit?.animaisAlojados || loteVisits[0]?.animaisAlojados || 0;
    const mortos = lastVisit?.animaisMortos || 0;
    
    totalAlojados += alojados;
    totalMortos += mortos;
    
    // Check Status Sanitário (Exact logic from LoteReport)
    const parseScore = (s?: number) => { if(!s) return 0; if(s===1) return 3; if(s===2) return 2; if(s===3) return 1; return 0; };
    const evalSanitaria = lastVisit?.avaliacao_tecnica;
    const validScores: {score: number}[] = [];
    if (evalSanitaria) {
      if (parseScore(evalSanitaria.granja?.limpeza_baias) > 0) validScores.push({ score: parseScore(evalSanitaria.granja?.limpeza_baias) });
      if (parseScore(evalSanitaria.granja?.desperdicio_racao) > 0) validScores.push({ score: parseScore(evalSanitaria.granja?.desperdicio_racao) });
      if (parseScore(evalSanitaria.granja?.ventilacao_cortinas) > 0) validScores.push({ score: parseScore(evalSanitaria.granja?.ventilacao_cortinas) });
      if (parseScore(evalSanitaria.suinos?.tosse) > 0) validScores.push({ score: parseScore(evalSanitaria.suinos?.tosse) });
      if (parseScore(evalSanitaria.suinos?.diarreia) > 0) validScores.push({ score: parseScore(evalSanitaria.suinos?.diarreia) });
      if (parseScore(evalSanitaria.suinos?.uniformidade) > 0) validScores.push({ score: parseScore(evalSanitaria.suinos?.uniformidade) });
      if (parseScore(evalSanitaria.suinos?.canibalismo) > 0) validScores.push({ score: parseScore(evalSanitaria.suinos?.canibalismo) });
    }

    let healthIndex = 0;
    if (validScores.length > 0) {
      const totalMax = validScores.length * 3;
      const scoreSum = validScores.reduce((sum, d) => sum + (d.score), 0);
      healthIndex = Math.round((scoreSum / totalMax) * 100);
    }
    
    if (validScores.length > 0 && healthIndex < 85) {
      lotesEmAlerta++;
    }
  });

  const mortGlobal = totalAlojados > 0 ? ((totalMortos / totalAlojados) * 100).toFixed(2) : '-';

  // Lotes ranking body
  const tableBody: TableCell[][] = [
    [
      { text: 'Nº Lote', style: 'tableHeader' },
      { text: 'Empresa / Produtor', style: 'tableHeader' },
      { text: 'Última Visita', style: 'tableHeader' },
      { text: 'Mort.', style: 'tableHeader', alignment: 'center' },
      { text: 'Cons./Meta', style: 'tableHeader', alignment: 'center' },
      { text: 'Aderência', style: 'tableHeader', alignment: 'center' },
      { text: 'Tratam.', style: 'tableHeader', alignment: 'center' },
      { text: 'Sanidade', style: 'tableHeader', alignment: 'center' }
    ]
  ];

  if (selectedLotes.length > 0) {
    selectedLotes.forEach((l, index) => {
      const loteVisits = selectedVisits.filter(v => v.integradoId === l.id).sort((a,b) => (a.idade || 0) - (b.idade || 0));
      const lastVisit = loteVisits.length > 0 ? loteVisits[loteVisits.length - 1] : null;
      
      const empresaName = empresas?.find(e => e.id === l.empresaId)?.nome || '-';
      
      const alojados = lastVisit?.animaisAlojados || loteVisits[0]?.animaisAlojados || 0;
      const mortos = lastVisit?.animaisMortos || 0;
      const mortPercentNum = alojados > 0 ? ((mortos / alojados) * 100) : 0;
      const mortPercent = alojados > 0 ? mortPercentNum.toFixed(2) + '%' : '-';
      
      
      
      // Calculate sanit status
      const parseScore = (s?: number) => { if(!s) return 0; if(s===1) return 3; if(s===2) return 2; if(s===3) return 1; return 0; };
      const evalSanitaria = lastVisit?.avaliacao_tecnica;
      const validScores: {score: number}[] = [];
      if (evalSanitaria) {
        if (parseScore(evalSanitaria.granja?.limpeza_baias) > 0) validScores.push({ score: parseScore(evalSanitaria.granja?.limpeza_baias) });
        if (parseScore(evalSanitaria.granja?.desperdicio_racao) > 0) validScores.push({ score: parseScore(evalSanitaria.granja?.desperdicio_racao) });
        if (parseScore(evalSanitaria.granja?.ventilacao_cortinas) > 0) validScores.push({ score: parseScore(evalSanitaria.granja?.ventilacao_cortinas) });
        if (parseScore(evalSanitaria.suinos?.tosse) > 0) validScores.push({ score: parseScore(evalSanitaria.suinos?.tosse) });
        if (parseScore(evalSanitaria.suinos?.diarreia) > 0) validScores.push({ score: parseScore(evalSanitaria.suinos?.diarreia) });
        if (parseScore(evalSanitaria.suinos?.uniformidade) > 0) validScores.push({ score: parseScore(evalSanitaria.suinos?.uniformidade) });
        if (parseScore(evalSanitaria.suinos?.canibalismo) > 0) validScores.push({ score: parseScore(evalSanitaria.suinos?.canibalismo) });
      }

      let healthIndex = 0;
      if (validScores.length > 0) {
        const totalMax = validScores.length * 3;
        const scoreSum = validScores.reduce((sum, d) => sum + (d.score), 0);
        healthIndex = Math.round((scoreSum / totalMax) * 100);
      }
      
      let sanitStatus = 'N/A';
      let sanitColor = '#94a3b8';
      let isAlerta = false;
      if (validScores.length > 0) {
        sanitStatus = `${healthIndex}%`;
        if (healthIndex >= 85) {
          sanitColor = '#10b981'; // Green
        } else if (healthIndex >= 65) {
          sanitColor = '#f59e0b'; // Amber
          isAlerta = true;
        } else {
          sanitColor = '#ef4444'; // Red
          isAlerta = true;
        }
      }

      // Expected and Real Consumption
      const targetAge = lastVisit?.idade || 0;
      const currentConfig = configs.find(c => c.empresa_id === l.empresaId);
      const latestCurveDate = currentConfig?.curva_desempenho && currentConfig.curva_desempenho.length > 0 
        ? [...currentConfig.curva_desempenho].sort((a: any, b: any) => (a.dataVigencia || "").localeCompare(b.dataVigencia || ""))[currentConfig.curva_desempenho.length - 1].dataVigencia 
        : undefined;

      
      const finalMetaMortalidade = currentConfig?.meta_mortalidade !== undefined && currentConfig?.meta_mortalidade !== null ? currentConfig.meta_mortalidade : 3;
      const propMetaMortalidade = targetAge ? Number(((Math.min(targetAge, 105) / 105) * finalMetaMortalidade).toFixed(2)) : finalMetaMortalidade;
      const isMortAlerta = mortPercentNum > propMetaMortalidade;
      const mortColor = isMortAlerta ? '#ef4444' : '#10b981';

      const consumoEsperado = targetAge > 0
        ? getExpectedConsumption(targetAge, lastVisit?.tipoLote, lastVisit?.pesoAloj, l.alojamentoDate, l.status, l.fechamentoDate, currentConfig, undefined, latestCurveDate)
        : null;

      const descartes = lastVisit?.descartesPeriodo || 0;
      const vivos = Math.max(0, alojados - mortos - descartes);
      const totalRacao = lastVisit?.volumeTotalCargas || 0;
      const consumoRealCab = lastVisit?.consumoAcumuladoReal !== undefined && lastVisit?.consumoAcumuladoReal !== null
        ? Number(lastVisit.consumoAcumuladoReal)
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

      const fillColor = index % 2 === 0 ? '#f8fafc' : '#ffffff';
      
      const lastVisitLabel = lastVisit 
        ? `${formatDate(lastVisit.date)} (${targetAge}d) | ${lastVisit.colaborador || '-'}`
        : '-';
        
      const hasTreatments = loteVisits.some(v => v.tratamentos && v.tratamentos.length > 0) ? 'Sim' : 'Não';
      const treatmentsColor = hasTreatments === 'Sim' ? '#ef4444' : '#10b981';

      tableBody.push([
        { text: l.loteNumber || '-', style: 'tableCell', fontSize: 8, fillColor },
        { text: `${empresaName} - ${l.name}`, style: 'tableCell', fontSize: 8, fillColor },
        { text: lastVisitLabel, style: 'tableCell', fontSize: 8, fillColor },
        { text: mortPercent, style: 'tableCell', fontSize: 8, alignment: 'center', color: mortColor, bold: isMortAlerta, fillColor },
        { text: (consumoRealCab !== undefined && consumoEsperado !== null) ? `${consumoRealCab.toFixed(1)} / ${consumoEsperado.toFixed(1)}` : '-', style: 'tableCell', fontSize: 8, alignment: 'center', color: consMetaColor, bold: consMetaBold, fillColor },
        { text: curveAccuracy !== null ? `${Math.round(curveAccuracy)}%` : '-', style: 'tableCell', fontSize: 8, alignment: 'center', color: accuracyColor, bold: curveAccuracy !== null && curveAccuracy < 90, fillColor },
        { text: hasTreatments, style: 'tableCell', fontSize: 8, alignment: 'center', bold: hasTreatments === 'Sim', color: treatmentsColor, fillColor },
        { text: sanitStatus, style: 'tableCell', fontSize: 8, color: sanitColor, alignment: 'center', bold: true, fillColor }
      ]);
    });
  } else {
    tableBody.push([
      { text: 'Nenhum lote selecionado.', colSpan: 8, style: 'tableCell', alignment: 'center', fillColor: '#f8fafc' },
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
            { text: 'RELATÓRIO CONSOLIDADO DE LOTES', style: 'subheader' }
          ]
        },
        {
          width: 'auto',
          stack: [
            { text: `Emissão: ${currentDate}`, fontSize: 10, alignment: 'right' },
            { text: `Lotes Selecionados: ${totalLotes}`, fontSize: 10, bold: true, alignment: 'right', margin: [0, 4, 0, 0] }
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
            { stack: [{ text: 'TOTAL DE LOTES', style: 'metricCardTitle' }, { text: `${totalLotes}`, style: 'metricCardValue' }, { text: 'Avaliados', fontSize: 8, color: '#64748b', alignment: 'center' }], fillColor: '#f8fafc', margin: [8, 10, 8, 10], border: [false, false, false, false] },
            { stack: [{ text: 'ALOJAMENTO GLOBAL', style: 'metricCardTitle' }, { text: `${totalAlojados.toLocaleString('pt-BR')}`, style: 'metricCardValue' }, { text: 'Suínos no período', fontSize: 8, color: '#64748b', alignment: 'center' }], fillColor: '#f8fafc', margin: [8, 10, 8, 10], border: [false, false, false, false] },
            { stack: [{ text: 'MORTALIDADE MÉDIA', style: 'metricCardTitle' }, { text: `${mortGlobal}%`, style: 'metricCardValue' }, { text: 'Acumulada', fontSize: 8, color: '#64748b', alignment: 'center' }], fillColor: '#f8fafc', margin: [8, 10, 8, 10], border: [false, false, false, false] },
            { stack: [{ text: 'LOTES EM ALERTA', style: 'metricCardTitle' }, { text: `${lotesEmAlerta}`, style: 'metricCardValue', color: lotesEmAlerta > 0 ? '#ef4444' : '#0f172a' }, { text: 'Índice < 85%', fontSize: 8, color: '#64748b', alignment: 'center' }], fillColor: '#f8fafc', margin: [8, 10, 8, 10], border: [false, false, false, false] }
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
        widths: ['auto', '*', '*', 'auto', 'auto', 'auto', 'auto', 'auto'],
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
          { text: `Página ${currentPage} de ${pageCount}`, style: 'footer', alignment: 'right', margin: [0, 0, 40, 0] }
        ]
      };
    },
    content: content
  };
};
