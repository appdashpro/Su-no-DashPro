const fs = require('fs');
let content = fs.readFileSync('src/components/IntegradoDetailsModal.tsx', 'utf8');

// Calculate realVisits before returning the JSX
const chartDataCalculation = `
  const realVisits = chartData.filter(d => d.real !== null && d.real !== undefined);
  const minReal = realVisits.length > 0 ? realVisits[0].idade : 1;
  const maxReal = realVisits.length > 0 ? realVisits[realVisits.length - 1].idade : 1;
`;

content = content.replace("        return (", chartDataCalculation + "\n        return (");

// Add defs to ComposedChart
const defsJSX = `
                      <defs>
                        <linearGradient id="colorReal" x1="0%" y1="0%" x2="100%" y2="0%">
                          {realVisits.map((v, index) => {
                            let color = '#3b82f6';
                            if (v.esperado !== null && v.esperado !== undefined) {
                              const diff = v.real - v.esperado;
                              if (diff > 5) color = '#ef4444';
                              else if (diff < -5) color = '#10b981';
                            }
                            const offset = maxReal === minReal ? 0 : ((v.idade - minReal) / (maxReal - minReal)) * 100;
                            return <stop key={index} offset={\`\${offset}%\`} stopColor={color} />;
                          })}
                        </linearGradient>
                      </defs>
`;

content = content.replace("<CartesianGrid", defsJSX + "                      <CartesianGrid");

// Update Line stroke to use the gradient
content = content.replace(/stroke="#e2e8f0"/, 'stroke="url(#colorReal)"');

fs.writeFileSync('src/components/IntegradoDetailsModal.tsx', content, 'utf8');
