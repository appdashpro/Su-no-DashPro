import fs from 'fs';

let content = fs.readFileSync('src/reports/charts.ts', 'utf-8');

const newGetLineChartCanvas = `export const getLineChartCanvas = (
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
  if (y1Points.length > 0) {
    // Area fill
    const areaPoints = [
      { x: y1Points[0].x, y: height - margin.bottom },
      ...y1Points,
      { x: y1Points[y1Points.length - 1].x, y: height - margin.bottom }
    ];
    canvas.push({ type: 'polyline', points: areaPoints, closePath: true, color: '#e2e8f0', fillOpacity: 0.5, lineWidth: 0 });
    
    // Dashed line
    canvas.push({ type: 'polyline', points: y1Points, closePath: false, lineColor: '#94a3b8', lineWidth: 2, dash: { length: 4, space: 4 } });
  }

  // Draw Y2 (Real) - solid line
  const y2Points = data.filter(d => d.y2 != null).map(d => ({ x: mapX(d.x), y: mapY(d.y2!) }));
  if (y2Points.length > 0) {
    canvas.push({ type: 'polyline', points: y2Points, closePath: false, lineColor: '#3b82f6', lineWidth: 2 });
    y2Points.forEach(p => {
       canvas.push({ type: 'ellipse', x: p.x, y: p.y, r1: 2, r2: 2, color: '#2563eb' });
    });
  }

  return canvas;
};`;

content = content.replace(/export const getLineChartCanvas = [\s\S]*?(?=;$|$)/, newGetLineChartCanvas);
fs.writeFileSync('src/reports/charts.ts', content);
