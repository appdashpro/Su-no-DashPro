import fs from 'fs';

function restoreAndFix(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Find the start of the Charts Row block and the end of it (up to Diagnóstico Sanitário)
  const regex = /\/\/\s*Charts Row[\s\S]*?\/\/\s*Diagnóstico Sanitário/m;
  
  const correctChartsRow = `// Charts Row
    {
      stack: [
        { text: 'CURVA DE CONSUMO VS ESPERADO', style: 'label', margin: [0, 0, 0, 10], alignment: 'left' },
        chartData.length > 0 
          ? {
              stack: [
                { canvas: getLineChartCanvas(chartData, 515, 180), margin: [0, 0, 0, 8] },
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

    // Diagnóstico Sanitário`;

  content = content.replace(regex, correctChartsRow);
  fs.writeFileSync(filePath, content);
}

restoreAndFix('src/reports/templates/LoteReport.ts');
restoreAndFix('src/reports/templates/VisitaReport.ts');
