import { CanvasElement } from 'pdfmake/interfaces';

export const getRadarChartCanvas = (scores: number[], maxScore: number = 3, size: number = 150): CanvasElement[] => {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 15; // Leave room
  let renderScores = [...scores];
  if (renderScores.length > 0 && renderScores.length < 3) {
     while (renderScores.length < 3) renderScores.push(0);
  }
  const sides = renderScores.length;
  if (sides === 0) return [];
  const angleStep = (Math.PI * 2) / sides;

  const canvas: CanvasElement[] = [];

  // draw concentric polygons
  for (let level = 1; level <= maxScore; level++) {
    const r = (radius / maxScore) * level;
    const points = [];
    for (let i = 0; i < sides; i++) {
      const a = i * angleStep - Math.PI / 2;
      points.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
    }
    canvas.push({ type: 'polyline', points, closePath: true, lineColor: '#e2e8f0', lineWidth: 1 });
  }

  // draw axes
  for (let i = 0; i < sides; i++) {
    const a = i * angleStep - Math.PI / 2;
    canvas.push({ type: 'line', x1: cx, y1: cy, x2: cx + radius * Math.cos(a), y2: cy + radius * Math.sin(a), lineColor: '#e2e8f0', lineWidth: 1 });
  }

  // draw data
  const dataPoints = [];
  for (let i = 0; i < sides; i++) {
    const val = renderScores[i] || 0;
    const r = (radius / maxScore) * val;
    const a = i * angleStep - Math.PI / 2;
    dataPoints.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  }

  if (dataPoints.length > 0) {
    canvas.push({ type: 'polyline', points: dataPoints, closePath: true, color: '#3b82f6', fillOpacity: 0.2, lineColor: '#2563eb', lineWidth: 2 });
    dataPoints.forEach(p => {
      canvas.push({ type: 'ellipse', x: p.x, y: p.y, r1: 3, r2: 3, color: '#1d4ed8' });
    });
  }

  return canvas;
};

export const getLineChartCanvas = (
  data: { x: number, y1?: number | null, y2?: number | null }[], 
  width: number = 300, 
  height: number = 150
): CanvasElement[] => {
  if (data.length === 0) return [];

  const margin = { top: 10, right: 10, bottom: 20, left: 30 };
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

  const canvas: CanvasElement[] = [];

  // Draw grid lines
  for (let i = 0; i <= 4; i++) {
    const yVal = minY + (maxY - minY) * (i / 4);
    const yPos = mapY(yVal);
    canvas.push({ type: 'line', x1: margin.left, y1: yPos, x2: width - margin.right, y2: yPos, lineColor: '#f1f5f9', lineWidth: 1 });
  }

  // Draw vertical grid lines (every ~20 days)
  const stepsX = 5;
  for (let i = 0; i <= stepsX; i++) {
    const xVal = minX + (maxX - minX) * (i / stepsX);
    const xPos = mapX(xVal);
    canvas.push({ type: 'line', x1: xPos, y1: margin.top, x2: xPos, y2: height - margin.bottom, lineColor: '#f1f5f9', lineWidth: 1 });
    // tick mark on x axis
    canvas.push({ type: 'line', x1: xPos, y1: height - margin.bottom, x2: xPos, y2: height - margin.bottom + 3, lineColor: '#cbd5e1', lineWidth: 1 });
  }

  // Draw axes
  canvas.push({ type: 'line', x1: margin.left, y1: margin.top, x2: margin.left, y2: height - margin.bottom, lineColor: '#94a3b8', lineWidth: 1 });
  canvas.push({ type: 'line', x1: margin.left, y1: height - margin.bottom, x2: width - margin.right, y2: height - margin.bottom, lineColor: '#94a3b8', lineWidth: 1 });

  // Draw Y1 (Esperado) - Area + dashed line
  const y1Points = data.filter(d => d.y1 != null).map(d => ({ x: mapX(d.x), y: mapY(d.y1!) }));
  if (y1Points.length > 1) {
    const areaPoints = [
      { x: y1Points[0].x, y: height - margin.bottom },
      ...y1Points,
      { x: y1Points[y1Points.length - 1].x, y: height - margin.bottom }
    ];
    canvas.push({ type: 'polyline', points: areaPoints, closePath: true, color: '#e2e8f0', fillOpacity: 0.5, lineWidth: 0 });
    canvas.push({ type: 'polyline', points: y1Points, closePath: false, lineColor: '#94a3b8', lineWidth: 2, dash: { length: 4, space: 4 } });
  } else if (y1Points.length === 1) {
    canvas.push({ type: 'ellipse', x: y1Points[0].x, y: y1Points[0].y, r1: 2, r2: 2, color: '#94a3b8' });
  }

  // Draw Y2 (Real) - solid line
  const y2Points = data.filter(d => d.y2 != null).map(d => ({ x: mapX(d.x), y: mapY(d.y2!) }));
  if (y2Points.length > 1) {
    canvas.push({ type: 'polyline', points: y2Points, closePath: false, lineColor: '#3b82f6', lineWidth: 2 });
    y2Points.forEach(p => {
       canvas.push({ type: 'ellipse', x: p.x, y: p.y, r1: 2, r2: 2, color: '#2563eb' });
    });
  } else if (y2Points.length === 1) {
    canvas.push({ type: 'ellipse', x: y2Points[0].x, y: y2Points[0].y, r1: 3, r2: 3, color: '#3b82f6' });
  }

  return canvas;
};


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

  let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" font-family="Roboto, sans-serif">`;

  // Draw grid lines and Y-axis labels
  for (let i = 0; i <= 4; i++) {
    const yVal = minY + (maxY - minY) * (i / 4);
    const yPos = mapY(yVal);
    
    // Grid line
    svg += `<line x1="${margin.left}" y1="${yPos}" x2="${width - margin.right}" y2="${yPos}" stroke="#f1f5f9" stroke-width="1" />`;
    
    // Y-axis label
    svg += `<text x="${margin.left - 5}" y="${yPos + 3}" fill="#94a3b8" font-size="8" text-anchor="end">${Math.round(yVal)}</text>`;
  }

  // Draw vertical grid lines and X-axis labels (every ~20 days or so)
  const stepsX = 5;
  for (let i = 0; i <= stepsX; i++) {
    const xVal = minX + (maxX - minX) * (i / stepsX);
    const xPos = mapX(xVal);
    
    // Grid line
    svg += `<line x1="${xPos}" y1="${margin.top}" x2="${xPos}" y2="${height - margin.bottom}" stroke="#f1f5f9" stroke-width="1" />`;
    
    // tick mark
    svg += `<line x1="${xPos}" y1="${height - margin.bottom}" x2="${xPos}" y2="${height - margin.bottom + 3}" stroke="#cbd5e1" stroke-width="1" />`;
    
    // X-axis label
    svg += `<text x="${xPos}" y="${height - margin.bottom + 12}" fill="#94a3b8" font-size="8" text-anchor="middle">${Math.round(xVal)}</text>`;
  }

  // Draw axes
  svg += `<line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${height - margin.bottom}" stroke="#94a3b8" stroke-width="1" />`;
  svg += `<line x1="${margin.left}" y1="${height - margin.bottom}" x2="${width - margin.right}" y2="${height - margin.bottom}" stroke="#94a3b8" stroke-width="1" />`;

  // Draw Y1 (Esperado)
  const y1Points = data.filter(d => d.y1 != null).map(d => ({ x: mapX(d.x), y: mapY(d.y1!) }));
  if (y1Points.length > 1) {
    const areaPath = `M ${y1Points[0].x} ${height - margin.bottom} ` + 
                     y1Points.map(p => `L ${p.x} ${p.y}`).join(' ') + 
                     ` L ${y1Points[y1Points.length - 1].x} ${height - margin.bottom} Z`;
    
    svg += `<path d="${areaPath}" fill="#e2e8f0" fill-opacity="0.5" />`;
    
    const linePath = `M ${y1Points[0].x} ${y1Points[0].y} ` + y1Points.map(p => `L ${p.x} ${p.y}`).join(' ');
    svg += `<path d="${linePath}" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4,4" />`;
  } else if (y1Points.length === 1) {
    svg += `<circle cx="${y1Points[0].x}" cy="${y1Points[0].y}" r="2" fill="#94a3b8" />`;
  }

  // Draw Y2 (Real)
  const y2Points = data.filter(d => d.y2 != null).map(d => ({ x: mapX(d.x), y: mapY(d.y2!) }));
  if (y2Points.length > 1) {
    const linePath = `M ${y2Points[0].x} ${y2Points[0].y} ` + y2Points.map(p => `L ${p.x} ${p.y}`).join(' ');
    svg += `<path d="${linePath}" fill="none" stroke="#3b82f6" stroke-width="2" />`;
    
    y2Points.forEach(p => {
       svg += `<circle cx="${p.x}" cy="${p.y}" r="2" fill="#2563eb" />`;
    });
  } else if (y2Points.length === 1) {
    svg += `<circle cx="${y2Points[0].x}" cy="${y2Points[0].y}" r="3" fill="#3b82f6" />`;
  }

  svg += `</svg>`;
  return svg;
};
