import fs from 'fs';

let chartsContent = fs.readFileSync('src/reports/charts.ts', 'utf-8');

const svgFunc = `
export const getLineChartSVG = (
  data: { x: number, y1?: number | null, y2?: number | null }[], 
  width: number = 300, 
  height: number = 150
): string => {
  if (data.length === 0) return '';

  const margin = { top: 10, right: 10, bottom: 25, left: 35 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const minX = Math.min(...data.map(d => d.x));
  const maxX = Math.max(...data.map(d => d.x));
  let minY = 0;
  let maxY = Math.max(
    ...data.map(d => Math.max(d.y1 || 0, d.y2 || 0))
  );
  if (maxY === 0) maxY = 10;
  maxY = Math.ceil(maxY * 1.1);

  const mapX = (val: number) => margin.left + ((val - minX) / (maxX - minX || 1)) * innerW;
  const mapY = (val: number) => margin.top + innerH - ((val - minY) / (maxY - minY)) * innerH;

  let svg = \`<svg width="\${width}" height="\${height}" viewBox="0 0 \${width} \${height}" xmlns="http://www.w3.org/2000/svg" font-family="Roboto, sans-serif">\`;

  // Draw grid lines and Y-axis labels
  for (let i = 0; i <= 4; i++) {
    const yVal = minY + (maxY - minY) * (i / 4);
    const yPos = mapY(yVal);
    
    // Grid line
    svg += \`<line x1="\${margin.left}" y1="\${yPos}" x2="\${width - margin.right}" y2="\${yPos}" stroke="#f1f5f9" stroke-width="1" />\`;
    
    // Y-axis label
    svg += \`<text x="\${margin.left - 5}" y="\${yPos + 3}" fill="#94a3b8" font-size="8" text-anchor="end">\${Math.round(yVal)}</text>\`;
  }

  // Draw vertical grid lines and X-axis labels (every ~20 days or so)
  const stepsX = 5;
  for (let i = 0; i <= stepsX; i++) {
    const xVal = minX + (maxX - minX) * (i / stepsX);
    const xPos = mapX(xVal);
    
    // Grid line
    svg += \`<line x1="\${xPos}" y1="\${margin.top}" x2="\${xPos}" y2="\${height - margin.bottom}" stroke="#f1f5f9" stroke-width="1" />\`;
    
    // tick mark
    svg += \`<line x1="\${xPos}" y1="\${height - margin.bottom}" x2="\${xPos}" y2="\${height - margin.bottom + 3}" stroke="#cbd5e1" stroke-width="1" />\`;
    
    // X-axis label
    svg += \`<text x="\${xPos}" y="\${height - margin.bottom + 12}" fill="#94a3b8" font-size="8" text-anchor="middle">\${Math.round(xVal)}</text>\`;
  }

  // Draw axes
  svg += \`<line x1="\${margin.left}" y1="\${margin.top}" x2="\${margin.left}" y2="\${height - margin.bottom}" stroke="#94a3b8" stroke-width="1" />\`;
  svg += \`<line x1="\${margin.left}" y1="\${height - margin.bottom}" x2="\${width - margin.right}" y2="\${height - margin.bottom}" stroke="#94a3b8" stroke-width="1" />\`;

  // Draw Y1 (Esperado)
  const y1Points = data.filter(d => d.y1 != null).map(d => ({ x: mapX(d.x), y: mapY(d.y1!) }));
  if (y1Points.length > 1) {
    const areaPath = \`M \${y1Points[0].x} \${height - margin.bottom} \` + 
                     y1Points.map(p => \`L \${p.x} \${p.y}\`).join(' ') + 
                     \` L \${y1Points[y1Points.length - 1].x} \${height - margin.bottom} Z\`;
    
    svg += \`<path d="\${areaPath}" fill="#e2e8f0" fill-opacity="0.5" />\`;
    
    const linePath = \`M \${y1Points[0].x} \${y1Points[0].y} \` + y1Points.map(p => \`L \${p.x} \${p.y}\`).join(' ');
    svg += \`<path d="\${linePath}" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4,4" />\`;
  } else if (y1Points.length === 1) {
    svg += \`<circle cx="\${y1Points[0].x}" cy="\${y1Points[0].y}" r="2" fill="#94a3b8" />\`;
  }

  // Draw Y2 (Real)
  const y2Points = data.filter(d => d.y2 != null).map(d => ({ x: mapX(d.x), y: mapY(d.y2!) }));
  if (y2Points.length > 1) {
    const linePath = \`M \${y2Points[0].x} \${y2Points[0].y} \` + y2Points.map(p => \`L \${p.x} \${p.y}\`).join(' ');
    svg += \`<path d="\${linePath}" fill="none" stroke="#3b82f6" stroke-width="2" />\`;
    
    y2Points.forEach(p => {
       svg += \`<circle cx="\${p.x}" cy="\${p.y}" r="2" fill="#2563eb" />\`;
    });
  } else if (y2Points.length === 1) {
    svg += \`<circle cx="\${y2Points[0].x}" cy="\${y2Points[0].y}" r="3" fill="#3b82f6" />\`;
  }

  svg += \`</svg>\`;
  return svg;
};
`;

chartsContent = chartsContent + '\n\n' + svgFunc;
fs.writeFileSync('src/reports/charts.ts', chartsContent);

function patchTemplate(file: string) {
  let tpl = fs.readFileSync(file, 'utf-8');
  tpl = tpl.replace(/getLineChartCanvas/g, 'getLineChartSVG');
  tpl = tpl.replace(/\{\s*canvas:\s*getLineChartSVG/g, '{ svg: getLineChartSVG');
  fs.writeFileSync(file, tpl);
}

patchTemplate('src/reports/templates/LoteReport.ts');
patchTemplate('src/reports/templates/VisitaReport.ts');

