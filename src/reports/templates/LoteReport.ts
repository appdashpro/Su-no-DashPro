import { TDocumentDefinitions, Content, TableCell } from 'pdfmake/interfaces';
import { Visit, Integrado, Empresa } from '../../types';
import { pdfStyles, defaultStyle, pdfLayouts } from '../pdfStyles';
import { getRadarChartCanvas, getLineChartSVG } from '../charts';
import { getExpectedConsumption } from '../../data';

export const getLoteTemplate = (
  lote: Integrado,
  empresa: Empresa | undefined,
  currentConfig: any,
  loteVisits: Visit[]
): TDocumentDefinitions => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
  };

  const sortedVisits = [...loteVisits].sort((a, b) => (a.idade || 0) - (b.idade || 0));
  const latestVisit = sortedVisits.length > 0 ? sortedVisits[sortedVisits.length - 1] : null;
  const targetAge = latestVisit?.idade || 0;

  const latestCurveDate = currentConfig?.curva_desempenho && currentConfig.curva_desempenho.length > 0 
    ? [...currentConfig.curva_desempenho].sort((a: any, b: any) => (a.dataVigencia || "").localeCompare(b.dataVigencia || ""))[currentConfig.curva_desempenho.length - 1].dataVigencia 
    : undefined;

  const consumoEsperado = targetAge > 0
    ? getExpectedConsumption(targetAge, latestVisit?.tipoLote, latestVisit?.pesoAloj, lote.alojamentoDate, lote.status, lote.fechamentoDate, currentConfig, undefined, latestCurveDate)
    : null;

  const alojados = latestVisit?.animaisAlojados || loteVisits[0]?.animaisAlojados || 0;
  const mortos = latestVisit?.animaisMortos || 0;
  const descartes = latestVisit?.descartesPeriodo || 0;
  const vivos = Math.max(0, alojados - mortos - descartes);
  const mortPercent = alojados > 0 ? ((mortos / alojados) * 100).toFixed(2) : '-';
  const totalRacao = latestVisit?.volumeTotalCargas || 0;
  const consumoRealCab = latestVisit?.consumoAcumuladoReal !== undefined && latestVisit?.consumoAcumuladoReal !== null
    ? Number(latestVisit.consumoAcumuladoReal)
    : (totalRacao > 0 && vivos > 0 ? Number((totalRacao / vivos).toFixed(2)) : undefined);
    
  const errorRate = (consumoRealCab !== undefined && consumoEsperado && consumoEsperado > 0) ? Math.abs(consumoRealCab - consumoEsperado) / consumoEsperado : null;
  const curveAccuracy = errorRate !== null ? Math.max(0, 100 - (errorRate * 100)) : null;

  // Radar logic (aggregate all technical evaluations for this lote or use the last one)
  const parseScore = (s?: number) => { if(!s) return 0; if(s===1) return 3; if(s===2) return 2; if(s===3) return 1; return 0; };
  const evalSanitaria = latestVisit?.avaliacao_tecnica;
  const validScores: {subject: string, score: number}[] = [];
  if (evalSanitaria) {
    if (parseScore(evalSanitaria.granja?.limpeza_baias) > 0) validScores.push({ subject: 'Limpeza', score: parseScore(evalSanitaria.granja?.limpeza_baias) });
    if (parseScore(evalSanitaria.granja?.desperdicio_racao) > 0) validScores.push({ subject: 'Desperdício', score: parseScore(evalSanitaria.granja?.desperdicio_racao) });
    if (parseScore(evalSanitaria.granja?.ventilacao_cortinas) > 0) validScores.push({ subject: 'Ventilação', score: parseScore(evalSanitaria.granja?.ventilacao_cortinas) });
    if (parseScore(evalSanitaria.suinos?.tosse) > 0) validScores.push({ subject: 'Tosse', score: parseScore(evalSanitaria.suinos?.tosse) });
    if (parseScore(evalSanitaria.suinos?.diarreia) > 0) validScores.push({ subject: 'Diarreia', score: parseScore(evalSanitaria.suinos?.diarreia) });
    if (parseScore(evalSanitaria.suinos?.uniformidade) > 0) validScores.push({ subject: 'Uniformidade', score: parseScore(evalSanitaria.suinos?.uniformidade) });
    if (parseScore(evalSanitaria.suinos?.canibalismo) > 0) validScores.push({ subject: 'Canibalismo', score: parseScore(evalSanitaria.suinos?.canibalismo) });
  }

  let healthIndex = 0;
  const radarScores: number[] = [];
    let healthColor = '#1e293b';
  let healthStatus = 'Não Avaliado';
  const diagnosticoTableBody: any[] = [
    [
      { text: 'Ponto de Avaliação', style: 'tableHeader' },
      { text: 'Resultado', style: 'tableHeader' },
      { text: 'Pontos', style: 'tableHeader', alignment: 'center' }
    ]
  ];
  if (validScores.length > 0) {
    const totalMax = validScores.length * 3;
    const scoreSum = validScores.reduce((sum, d) => sum + (d.score), 0);
    healthIndex = Math.round((scoreSum / totalMax) * 100);
    validScores.forEach(v => radarScores.push(v.score));

  
  

  if (healthIndex >= 85) {
    healthColor = '#10b981';
    healthStatus = 'Excelente (Poucos ou nenhum risco)';
  } else if (healthIndex >= 65) {
    healthColor = '#f59e0b';
    healthStatus = 'Atenção (Requer monitoramento)';
  } else if (healthIndex > 0) {
    healthColor = '#ef4444';
    healthStatus = 'Crítico (Ação imediata necessária)';
  }

  
    

  validScores.forEach(item => {
      let res = 'Não Avaliado';
      let color = '#94a3b8';
      if (item.score === 3) { res = 'Bom'; color = '#10b981'; }
      if (item.score === 2) { res = 'Regular'; color = '#f59e0b'; }
      if (item.score === 1) { res = 'Ruim'; color = '#ef4444'; }
      
      diagnosticoTableBody.push([
        { text: item.subject, style: 'tableCell', color: '#1e293b', margin: [0, 5, 0, 5] },
        { text: res, style: 'tableCell', color: color, bold: true, margin: [0, 5, 0, 5] },
        { text: item.score.toString(), style: 'tableCell', alignment: 'center', margin: [0, 5, 0, 5] }
      ]);
  });

  }

  const chartData = [];
  if (targetAge > 0) {
    const maxIdade = Math.max(105, targetAge);
    for (let d = 1; d <= maxIdade; d++) {
      const v = sortedVisits.find(x => x.idade === d);
      const esperado = getExpectedConsumption(d, latestVisit?.tipoLote, latestVisit?.pesoAloj, lote.alojamentoDate, lote.status, lote.fechamentoDate, currentConfig, undefined, latestCurveDate);
      chartData.push({
        x: d,
        y1: (esperado !== null && esperado !== undefined && esperado > 0) ? Number(esperado.toFixed(2)) : null,
        y2: (v && v.consumoAcumuladoReal && Number(v.consumoAcumuladoReal) > 0) ? Number(v.consumoAcumuladoReal) : null
      });
    }
  }

  const allTratamentos = sortedVisits
    .filter(v => v.tratamentos && v.tratamentos.length > 0)
    .flatMap(v => v.tratamentos!.map(t => ({
      date: v.date,
      idade: v.idade,
      produtoNome: t.produto,
      motivo: t.motivo,
      duracaoDias: t.duracaoDias
    })));

  const tratamentosBody: TableCell[][] = [
    [
      { text: 'Data (Idade)', style: 'tableHeader' },
      { text: 'Produto', style: 'tableHeader' },
      { text: 'Motivo', style: 'tableHeader' },
      { text: 'Duração', style: 'tableHeader', alignment: 'center' }
    ]
  ];

  if (allTratamentos.length > 0) {
    allTratamentos.forEach((t, i) => {
      const fillColor = i % 2 === 0 ? '#f8fafc' : '#ffffff';
      tratamentosBody.push([
        { text: `${formatDate(t.date)} (${t.idade}d)`, style: 'tableCell', fillColor },
        { text: t.produtoNome || '-', style: 'tableCell', fillColor },
        { text: t.motivo || '-', style: 'tableCell', fillColor },
        { text: t.duracaoDias ? `${t.duracaoDias} dias` : '-', style: 'tableCell', alignment: 'center', fillColor }
      ]);
    });
  } else {
    tratamentosBody.push([
      { text: 'Nenhum tratamento prescrito neste lote.', colSpan: 4, style: 'tableCell', alignment: 'center', fillColor: '#f8fafc' },
      {}, {}, {}
    ]);
  }

  // Recomendações Timeline
  const allRecomendacoes = sortedVisits
    .filter(v => v.recomendacao)
    .map(v => ({
      date: v.date,
      idade: v.idade,
      texto: v.recomendacao
    })).reverse();

  const recomendacoesBody: TableCell[][] = [];
  if (allRecomendacoes.length > 0) {
    allRecomendacoes.forEach((r, index) => {
      recomendacoesBody.push([
        {
          stack: [
            { text: `${formatDate(r.date)} (Idade: ${r.idade} dias)`, bold: true, color: '#475569', margin: [0, 0, 0, 4] },
            { text: r.texto || '' }
          ],
          margin: [10, 10, 10, 10],
          fillColor: '#f8fafc',
          border: [false, index === 0 ? false : true, false, false]
        }
      ]);
    });
  } else {
    recomendacoesBody.push([
      { text: 'Nenhuma recomendação registrada.', margin: [14, 14, 14, 14], fillColor: '#f8fafc', border: [false, false, false, false] }
    ]);
  }

  const content: Content[] = [
    // Double Header
    {
      columns: [
        {
          width: '*',
          stack: [
            { text: 'DASHPRO', style: 'header' },
            { text: lote.status === 'Fechado' ? 'RELATÓRIO DE FECHAMENTO' : 'RELATÓRIO PARCIAL DO LOTE', style: 'subheader' }
          ]
        },
        {
          width: 'auto',
          stack: [
            { text: lote.name, fontSize: 16, bold: true, color: '#0f172a', alignment: 'right' },
            { text: `Alojamento: ${formatDate(lote.alojamentoDate)}`, fontSize: 10, color: '#475569', alignment: 'right' },
            { text: `Fechamento: ${lote.fechamentoDate ? formatDate(lote.fechamentoDate) : 'Em aberto'}`, fontSize: 10, color: '#475569', alignment: 'right' },
            { text: `Idade Atual: ${targetAge} dias`, fontSize: 10, color: '#0f172a', bold: true, alignment: 'right', margin: [0, 4, 0, 0] }
          ]
        }
      ],
      margin: [0, 0, 0, 10]
    },
    { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 2, lineColor: '#0f172a' }], margin: [0, 0, 0, 10] },

    // KPIs Grid (No Borders, Cards)
    {
      table: {
        widths: ['*', '*', '*', '*'],
        body: [
          [
            { stack: [{ text: 'MORTALIDADE', style: 'metricCardTitle' }, { text: `${mortPercent}%`, style: 'metricCardValue' }, { text: `${mortos} mortos / ${alojados} aloj.`, fontSize: 8, color: '#64748b', alignment: 'center' }], fillColor: '#f8fafc', margin: [8, 10, 8, 10], border: [false, false, false, false] },
            { stack: [{ text: 'CONSUMO MÉDIO', style: 'metricCardTitle' }, { text: `${consumoRealCab?.toFixed(1) || '-'}`, style: 'metricCardValue' }, { text: `Meta: ${consumoEsperado?.toFixed(1) || '-'} kg`, fontSize: 8, color: '#64748b', alignment: 'center' }], fillColor: '#f8fafc', margin: [8, 10, 8, 10], border: [false, false, false, false] },
            { stack: [{ text: 'ADERÊNCIA', style: 'metricCardTitle' }, { text: curveAccuracy !== null ? `${Math.round(curveAccuracy)}%` : '-', style: 'metricCardValue' }, { text: 'Real vs Esperado', fontSize: 8, color: '#64748b', alignment: 'center' }], fillColor: '#f8fafc', margin: [8, 10, 8, 10], border: [false, false, false, false] },
            { stack: [{ text: 'ÍNDICE SANITÁRIO', style: 'metricCardTitle' }, { text: `${healthIndex}%`, style: 'metricCardValue' }, { text: 'Status Global', fontSize: 8, color: '#64748b', alignment: 'center' }], fillColor: '#f8fafc', margin: [8, 10, 8, 10], border: [false, false, false, false] }
          ]
        ]
      },
      layout: 'noBorders',
      margin: [0, 0, 0, 15]
    },

    // Charts Row
    { unbreakable: true, stack: [{ text: 'CURVA DE CONSUMO VS ESPERADO', style: 'label', margin: [0, 0, 0, 10], alignment: 'left' },
        chartData.length > 0 
          ? {
              stack: [
                { svg: getLineChartSVG(chartData, 515, 180), margin: [0, 0, 0, 8] },
                {
                  columns: [
                    { width: 'auto', text: 'Dias', fontSize: 8, color: '#94a3b8', margin: [5, 0, 0, 0] },
                    { width: '*', text: '' },
                    { canvas: [{ type: 'rect', x: 0, y: 3, w: 12, h: 6, color: '#e2e8f0' }], width: 16 },
                    { width: 'auto', text: 'Área Esperada', fontSize: 8, color: '#64748b', margin: [0, 1, 10, 0] },
                    { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 12, y2: 5, lineWidth: 2, lineColor: '#94a3b8', dash: { length: 2, space: 2 } }], width: 16 },
                    { width: 'auto', text: 'Curva Ideal', fontSize: 8, color: '#64748b', margin: [0, 1, 10, 0] },
                    { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 12, y2: 5, lineWidth: 2, lineColor: '#3b82f6' }], width: 16 },
                    { width: 'auto', text: 'Realizado', fontSize: 8, color: '#64748b', margin: [0, 1, 0, 0] }
                  ]
                }
              ]
            }
          : { text: 'Dados insuficientes para curva de consumo', color: '#94a3b8', fontSize: 10, margin: [0, 20, 0, 30] }
      ],
      margin: [0, 0, 0, 15]
    },

    // Diagnóstico Sanitário
    { text: 'DIAGNÓSTICO SANITÁRIO', style: 'sectionTitle' },
    {
      columns: [
        {
          width: '50%',
          stack: [
            { text: `ÍNDICE GLOBAL: ${healthIndex}%`, style: 'label', margin: [0, 0, 0, 5], color: healthColor },
            { text: healthStatus, fontSize: 10, color: healthColor, bold: true, margin: [0, 0, 0, 15] },
            validScores.length > 0 
              ? {
                  table: {
                    headerRows: 1,
                    widths: ['*', 'auto', 'auto'],
                    body: diagnosticoTableBody
                  },
                  layout: pdfLayouts.customLayout
                }
              : { text: 'Nenhuma avaliação registrada.', fontSize: 10, color: '#94a3b8' }
          ]
        },
        {
          width: '50%',
          stack: [
            { text: 'RADAR SANITÁRIO', style: 'label', margin: [0, 0, 0, 10], alignment: 'center' },
            radarScores.length > 0
              ? { canvas: getRadarChartCanvas(radarScores, 3, 160), alignment: 'center', margin: [0, 0, 0, 10] }
              : { text: 'Nenhuma avaliação técnica', color: '#94a3b8', fontSize: 10, margin: [0, 50, 0, 50], alignment: 'center' },
            radarScores.length > 0
              ? {
                  columns: [
                    { width: '*', text: '' },
                    { width: 'auto', stack: [
                      { text: 'Legenda:', fontSize: 8, color: '#64748b', margin: [0, 0, 0, 2] },
                      { text: 'Centro = 0 pontos (Pior)', fontSize: 8, color: '#64748b' },
                      { text: 'Borda = 3 pontos (Melhor)', fontSize: 8, color: '#64748b' }
                    ]},
                    { width: '*', text: '' }
                  ]
                }
              : { text: '' }
          ]
        }
      ],
      columnGap: 20,
      margin: [0, 0, 0, 15]
    },

    // Tratamentos Histórico (Zebra Table)
    { text: 'HISTÓRICO DE TRATAMENTOS', style: 'sectionTitle' },
    {
      table: {
        headerRows: 1,
        widths: ['auto', '*', '*', 'auto'],
        body: tratamentosBody
      },
      layout: pdfLayouts.customLayout,
      margin: [0, 0, 0, 10]
    },

    // Recomendações Histórico
    { text: 'OCORRÊNCIAS E RECOMENDAÇÕES', style: 'sectionTitle' },
    {
      table: {
        widths: ['*'],
        body: recomendacoesBody
      },
      layout: {
        hLineWidth: (i: number, node: any) => i === 0 || i === node.table.body.length ? 0 : 1,
        vLineWidth: () => 0,
        hLineColor: () => '#e2e8f0',
      },
      margin: [0, 0, 0, 15]
    }
  ];

  return {
    pageSize: 'A4',
    pageOrientation: 'portrait',
    pageMargins: [30, 30, 30, 40],
    styles: pdfStyles,
    defaultStyle: defaultStyle,
    info: {
      title: 'Relatório do Lote',
      author: 'Suíno DashPro',
      subject: `Lote ${lote.name}`
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
