const fs = require('fs');
const file = 'src/components/IntegradoDetailsModal.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add recharts imports
content = content.replace(
  /import \{ ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis \} from 'recharts';/,
  "import { ComposedChart, Line, Area, Bar, BarChart, ReferenceLine, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';"
);

// 2. Add phase calculations before chartData loop finishes (we'll just calculate them after chartData)
const chartDataLoopEnd = /  for \(let d = 1; d <= maxIdade; d\+\+\) \{[\s\S]*?     \}\);\n  \}/;

const phaseCalc = `
  const activeCurveInfo = getActiveCurve(lote?.alojamentoDate, lote?.status, loteVisits[0]?.tipoLote, lote?.fechamentoDate, undefined, loteVisits[0]?.curva_consumo_id, loteVisits[0]?.date);
  const metas = activeCurveInfo?.metas;
  const phaseMilestones = [];
  if (metas) {
    let accum = 0;
    const phaseDefs = [
       { key: 'metaAlojamento', label: 'Aloj.' },
       { key: 'metaCrescimento1', label: 'Cr. 1' },
       { key: 'metaCrescimento2', label: 'Cr. 2' },
       { key: 'metaCrescimento3', label: 'Cr. 3' },
       { key: 'metaTerminacao1', label: 'Te. 1' },
       { key: 'metaTerminacao2', label: 'Te. 2' }
    ];
    let phaseIdx = 0;
    accum += metas[phaseDefs[phaseIdx].key] || 0;
    for (let i = 0; i < chartData.length; i++) {
      if (phaseIdx >= phaseDefs.length) break;
      if (chartData[i].esperado !== null && chartData[i].esperado >= accum) {
         phaseMilestones.push({
            idade: chartData[i].idade,
            label: phaseDefs[phaseIdx].label
         });
         phaseIdx++;
         if (phaseIdx < phaseDefs.length) {
            accum += metas[phaseDefs[phaseIdx].key] || 0;
         }
      }
    }
  }
  
  // Prepare mortality chart data
  const mortalityData = loteVisits.map(v => ({
    idade: v.idade || 0,
    mortos: v.animaisMortos || 0,
    descartes: v.descartes_periodo || v.descartesPeriodo || 0,
    date: v.date
  })).sort((a, b) => a.idade - b.idade);
`;

content = content.replace(chartDataLoopEnd, match => match + '\n' + phaseCalc);

// 3. Update ComposedChart for error band and milestones
const chartSection = /<ComposedChart data=\{chartData\} margin=\{\{ top: 10, right: 10, left: -20, bottom: 0 \}\}>[\s\S]*?<\/ComposedChart>/;

const newChartSection = `<ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <defs>
                        <linearGradient id="colorReal" x1="0%" y1="0%" x2="100%" y2="0%">
                          {realVisits.map((v, index) => {
                            let color = '#3b82f6';
                            if (v.esperado !== null && v.esperado !== undefined && v.real !== null && v.real !== undefined) {
                              const diff = v.real - v.esperado;
                              if (diff > 5) color = '#ef4444';
                              else if (diff < -5) color = '#10b981';
                            }
                            const offset = maxReal === minReal ? 0 : ((v.idade - minReal) / (maxReal - minReal)) * 100;
                            return <stop key={index} offset={\`\${offset}%\`} stopColor={color} />;
                          })}
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      {phaseMilestones.map((pm, i) => (
                        <ReferenceLine key={i} x={pm.idade} stroke="#cbd5e1" strokeDasharray="3 3">
                           <Label value={pm.label} position="insideTopRight" offset={10} fill="#94a3b8" fontSize={10} />
                        </ReferenceLine>
                      ))}
                      <XAxis dataKey="idade" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} minTickGap={20} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                        labelStyle={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}
                        formatter={(value, name, props) => {
                          if (name === "Consumo Real" && props.payload.esperado) {
                             const diff = (value - props.payload.esperado).toFixed(2);
                             return [\`\${value} kg (\${diff > 0 ? '+' : ''}\${diff} kg)\`, name];
                          }
                          return [\`\${value} kg\`, name];
                        }}
                        labelFormatter={(label) => \`Idade: \${label} dias\`}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Area type="monotone" dataKey="real" stroke="none" fill="url(#colorReal)" fillOpacity={0.15} connectNulls={true} />
                      <Line type="monotone" dataKey="esperado" name="Consumo Esperado" stroke="#94a3b8" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                      <Line 
                        type="monotone" 
                        dataKey="real" 
                        name="Consumo Real" 
                        stroke="url(#colorReal)" 
                        strokeWidth={2} 
                        connectNulls={true}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                        dot={(props) => {
                          const { cx, cy, payload, value } = props;
                          if (value === null || value === undefined) return null;
                          let dotColor = '#3b82f6'; 
                          if (payload.esperado !== null && payload.esperado !== undefined) {
                            const diff = payload.real - payload.esperado;
                            if (diff > 5) dotColor = '#ef4444'; 
                            else if (diff < -5) dotColor = '#10b981'; 
                          }
                          return <circle key={\`dot-\${payload.idade}\`} cx={cx} cy={cy} r={4} fill={dotColor} stroke="#fff" strokeWidth={1.5} />;
                        }}
                      />
                    </ComposedChart>`;

content = content.replace(chartSection, newChartSection);

// We need to import Label from recharts for ReferenceLine labels
content = content.replace(
  "ReferenceLine, XAxis",
  "ReferenceLine, Label, XAxis"
);


// 4. Add Mortality Chart under Consumption Chart
const mortalitySection = `
              </div>

              <div className="mb-8 mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-0">Mortalidade e Descartes (Surtos e Picos)</h4>
                </div>
                <div className="h-64 w-full bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mortalityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="idade" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                        labelStyle={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}
                        labelFormatter={(label) => \`Idade: \${label} dias\`}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar dataKey="mortos" name="Mortos" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="descartes" name="Descartes" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <h4 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">Histórico de Visitas</h4>
`;

content = content.replace(/<\/div>\s*<\/div>\s*<h4 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">Histórico de Visitas<\/h4>/, mortalitySection);

fs.writeFileSync(file, content, 'utf8');
console.log('Success');
