import fs from 'fs';

function fixChartsTs() {
  let content = fs.readFileSync('src/reports/charts.ts', 'utf-8');
  
  // Radar chart fix: ensure at least 3 sides
  content = content.replace(
    /const sides = scores\.length;\s*if \(sides === 0\) return \[\];/,
    `let renderScores = [...scores];
  if (renderScores.length > 0 && renderScores.length < 3) {
     while (renderScores.length < 3) renderScores.push(0);
  }
  const sides = renderScores.length;
  if (sides === 0) return [];`
  );
  content = content.replace(/const val = scores\[i\] \|\| 0;/g, 'const val = renderScores[i] || 0;');

  // Line chart fix: prevent 1-point polyline crash
  const newY1 = `if (y1Points.length > 1) {
    const areaPoints = [
      { x: y1Points[0].x, y: height - margin.bottom },
      ...y1Points,
      { x: y1Points[y1Points.length - 1].x, y: height - margin.bottom }
    ];
    canvas.push({ type: 'polyline', points: areaPoints, closePath: true, color: '#e2e8f0', fillOpacity: 0.5, lineWidth: 0 });
    canvas.push({ type: 'polyline', points: y1Points, closePath: false, lineColor: '#94a3b8', lineWidth: 2, dash: { length: 4, space: 4 } });
  } else if (y1Points.length === 1) {
    canvas.push({ type: 'ellipse', x: y1Points[0].x, y: y1Points[0].y, r1: 2, r2: 2, color: '#94a3b8' });
  }`;

  const newY2 = `if (y2Points.length > 1) {
    canvas.push({ type: 'polyline', points: y2Points, closePath: false, lineColor: '#3b82f6', lineWidth: 2 });
    y2Points.forEach(p => {
       canvas.push({ type: 'ellipse', x: p.x, y: p.y, r1: 2, r2: 2, color: '#2563eb' });
    });
  } else if (y2Points.length === 1) {
    canvas.push({ type: 'ellipse', x: y2Points[0].x, y: y2Points[0].y, r1: 3, r2: 3, color: '#3b82f6' });
  }`;

  content = content.replace(/if \(y1Points\.length > 0\) \{[\s\S]*?(?=\/\/\s*Draw Y2)/, newY1 + '\n\n  ');
  content = content.replace(/if \(y2Points\.length > 0\) \{[\s\S]*?(?=return canvas;)/, newY2 + '\n\n  ');

  fs.writeFileSync('src/reports/charts.ts', content);
}

function fixLegend(file: string) {
  let content = fs.readFileSync(file, 'utf-8');
  
  const nestedLegendRegex = /\{\s*columns:\s*\[\s*\{\s*width:\s*'auto',\s*text:\s*'Dias'[\s\S]*?\]\s*\}\s*\]\s*\}\s*\]\s*\}/m;
  
  const safeLegend = `{
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
                }`;

  content = content.replace(nestedLegendRegex, safeLegend);
  fs.writeFileSync(file, content);
}

fixChartsTs();
fixLegend('src/reports/templates/LoteReport.ts');
fixLegend('src/reports/templates/VisitaReport.ts');
