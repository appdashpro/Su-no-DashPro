import fs from 'fs';

const filePath = 'src/components/Dashboard.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Add linear regression calculation
const regressionLogic = `
  const { regressionLine, rSquared } = useMemo(() => {
    if (latestVisitsData.length < 2) return { regressionLine: [], rSquared: 0 };
    
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    const n = latestVisitsData.length;
    
    let minX = Infinity;
    let maxX = -Infinity;

    latestVisitsData.forEach(d => {
      const x = d.sanidade;
      const y = d.mortalidade;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
      sumY2 += y * y;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
    });

    const denominator = (n * sumX2 - sumX * sumX);
    if (denominator === 0) return { regressionLine: [], rSquared: 0 };

    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;

    // Calculate R-squared
    const meanY = sumY / n;
    let ssTot = 0;
    let ssRes = 0;
    latestVisitsData.forEach(d => {
      const x = d.sanidade;
      const y = d.mortalidade;
      const predictedY = slope * x + intercept;
      ssTot += Math.pow(y - meanY, 2);
      ssRes += Math.pow(y - predictedY, 2);
    });
    
    const r2 = ssTot === 0 ? 1 : 1 - (ssRes / ssTot);

    // Give some padding to the line for visual effect
    const paddingX = (maxX - minX) * 0.1 || 5;
    const startX = Math.max(0, minX - paddingX);
    const endX = Math.min(100, maxX + paddingX);

    return {
      regressionLine: [
        { sanidade: startX, mortalidade: slope * startX + intercept },
        { sanidade: endX, mortalidade: slope * endX + intercept }
      ],
      rSquared: r2
    };
  }, [latestVisitsData]);
`;

// Insert it right after the stats useMemo
content = content.replace(/  \}, \[latestVisitsData, filteredIntegrados\.length\]\);/, "  }, [latestVisitsData, filteredIntegrados.length]);\n" + regressionLogic);

// 2. Adjust domains and add ComposedChart structure for Scatter + Line
const scatterChartReplacement = `
          <div className="mb-6">
            <h2 className="text-base font-bold text-slate-800">Sanidade vs Mortalidade</h2>
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-slate-500">Correlação na última avaliação dos lotes</p>
              {latestVisitsData.length >= 2 && (
                <div className="text-xs font-semibold text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                  R² = {rSquared.toFixed(4)}
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 min-h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  type="number" 
                  dataKey="sanidade" 
                  name="Sanidade" 
                  unit="%" 
                  domain={['auto', 'auto']} 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  label={{ value: 'Índice de Sanidade (%)', position: 'bottom', offset: 0 }} 
                  tick={{fill: '#64748b'}} 
                />
                <YAxis 
                  type="number" 
                  dataKey="mortalidade" 
                  name="Mortalidade" 
                  unit="%" 
                  domain={['auto', 'auto']} 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  label={{ value: 'Mortalidade (%)', angle: -90, position: 'insideLeft', offset: 25 }} 
                  tick={{fill: '#64748b'}} 
                />
                <ZAxis type="category" dataKey="name" name="Lote" />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }} 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                  formatter={(value, name) => [\`\${Number(value).toFixed(1)}%\`, name === 'sanidade' ? 'Sanidade' : name === 'mortalidade' ? 'Mortalidade' : name]}
                />
                <Scatter name="Lotes" data={latestVisitsData} fill="#3b82f6" shape="circle">
                  {latestVisitsData.map((entry, index) => {
                    let color = '#3b82f6'; // Azul - Normal
                    if (entry.sanidade < 85 || entry.mortalidade > 3.0) color = '#ef4444'; // Vermelho - Alerta
                    else if (entry.sanidade >= 95 && entry.mortalidade < 1.5) color = '#10b981'; // Verde - Ótimo
                    return <Cell key={\`cell-\${index}\`} fill={color} />;
                  })}
                </Scatter>
                {latestVisitsData.length >= 2 && (
                  <Line 
                    data={regressionLine} 
                    type="linear" 
                    dataKey="mortalidade" 
                    stroke="#f97316" 
                    strokeWidth={2} 
                    strokeDasharray="5 5" 
                    dot={false} 
                    activeDot={false} 
                    name="Tendência" 
                    isAnimationActive={false}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
`;

// Replace ScatterChart section
content = content.replace(/<div className="mb-6">\s*<h2 className="text-base font-bold text-slate-800">Sanidade vs Mortalidade<\/h2>\s*<p className="text-xs text-slate-500 mt-1">Correlação na última avaliação dos lotes<\/p>\s*<\/div>\s*<div className="flex-1 min-h-\[350px\]">\s*<ResponsiveContainer width="100%" height="100%">\s*<ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>[\s\S]*?<\/ScatterChart>\s*<\/ResponsiveContainer>\s*<\/div>/, scatterChartReplacement);

fs.writeFileSync(filePath, content);
