import fs from 'fs';

function updateReport(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // Add the diagnostic table generation logic right after validScores populating logic
  const targetLogicInsert = `validScores.forEach(v => radarScores.push(v.score));`;
  const insertLogic = `validScores.forEach(v => radarScores.push(v.score));

  let healthColor = '#1e293b';
  let healthStatus = 'Não Avaliado';

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

  const diagnosticoTableBody: any[] = [
    [
      { text: 'Ponto de Avaliação', style: 'tableHeader' },
      { text: 'Resultado', style: 'tableHeader' },
      { text: 'Pontos', style: 'tableHeader', alignment: 'center' }
    ]
  ];

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
`;

  content = content.replace(targetLogicInsert, insertLogic);

  // Replace Charts Row with full width Consumption Chart, and add Diagnostic Section
  const chartsRowRegex = /\/\/\s*Charts Row[\s\S]*?columnGap: 20,\s*margin: \[0, 0, 0, 20\]\s*\},/m;

  const newChartsAndDiag = `// Charts Row
    {
      stack: [
        { text: 'CURVA DE CONSUMO VS ESPERADO', style: 'label', margin: [0, 0, 0, 10], alignment: 'left' },
        chartData.length > 0 
          ? { canvas: getLineChartCanvas(chartData, 515, 180), margin: [0, 0, 0, 10] }
          : { text: 'Dados insuficientes para curva de consumo', color: '#94a3b8', fontSize: 10, margin: [0, 20, 0, 30] }
      ],
      margin: [0, 0, 0, 20]
    },

    // Diagnóstico Sanitário
    { text: 'DIAGNÓSTICO SANITÁRIO', style: 'sectionTitle' },
    {
      columns: [
        {
          width: '50%',
          stack: [
            { text: \`ÍNDICE GLOBAL: \${healthIndex}%\`, style: 'label', margin: [0, 0, 0, 5], color: healthColor },
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
      margin: [0, 0, 0, 30]
    },`;

  content = content.replace(chartsRowRegex, newChartsAndDiag);
  
  fs.writeFileSync(filePath, content);
}

updateReport('src/reports/templates/LoteReport.ts');
updateReport('src/reports/templates/VisitaReport.ts');
