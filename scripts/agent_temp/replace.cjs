const fs = require('fs');
const file = 'src/components/IntegradoDetailsModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /\{activeTab === 'geral' && \(\s*<>\s*<div className="grid grid-cols-2 gap-4 mb-6">[\s\S]*?<h4 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">Histórico de Visitas<\/h4>/;

const newContentStr = `{activeTab === 'geral' && (
              <>
              {(() => {
                const loteVisitsAsc = visits.filter(v => v.integradoId === selectedIntegradoDetails)
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                const latestVisit = loteVisitsAsc.length > 0 ? loteVisitsAsc[loteVisitsAsc.length - 1] : null;
                const totalRacao = latestVisit?.volumeTotalCargas || 0;
                let mortPercent = 0;
                if (latestVisit?.animaisMortos && latestVisit?.animaisAlojados) {
                   mortPercent = (latestVisit.animaisMortos / latestVisit.animaisAlojados) * 100;
                } else if (latestVisit?.mortalidade) {
                   mortPercent = latestVisit.mortalidade;
                }
                const idade = latestVisit?.idade || 0;

                return (
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center">
                       <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Ração Entregue</div>
                       <div className="text-lg font-bold text-slate-800">{totalRacao > 0 ? \`\${totalRacao} kg\` : '-'}</div>
                     </div>
                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center">
                       <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Mortalidade Acum.</div>
                       <div className="text-lg font-bold text-slate-800">{mortPercent > 0 ? \`\${mortPercent.toFixed(2)}%\` : '-'}</div>
                     </div>
                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center">
                       <div className="flex justify-between items-center mb-1">
                         <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Aderência</div>
                         {curveAccuracy !== null && (
                            <button onClick={() => setShowAdherenceInfo(true)} className="text-[10px] text-blue-500 hover:underline">Info</button>
                         )}
                       </div>
                       <div className={\`text-lg font-bold \${accuracyColorClass.replace('bg-', 'text-').replace('-100', '-600').split(' ')[1] || 'text-slate-800'}\`}>
                         {curveAccuracy !== null ? \`\${curveAccuracy}%\` : '-'}
                       </div>
                     </div>
                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center">
                       <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Idade Atual</div>
                       <div className="text-lg font-bold text-slate-800">{idade > 0 ? \`\${idade} dias\` : '-'}</div>
                     </div>
                   </div>
                );
              })()}

              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-0">Curva de Consumo do Lote (Real vs Meta)</h4>
                </div>
                <div className="h-72 w-full bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                      <XAxis dataKey="idade" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} minTickGap={20} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                        labelStyle={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}
                        formatter={(value) => [\`\${value} kg\`, '']}
                        labelFormatter={(label) => \`Idade: \${label} dias\`}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
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
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <h4 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">Histórico de Visitas</h4>`;

if (regex.test(content)) {
  content = content.replace(regex, newContentStr);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Success');
} else {
  console.log('Regex did not match');
}
