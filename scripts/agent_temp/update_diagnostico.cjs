const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src', 'components', 'IntegradoDetailsModal.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const oldTab = `              {activeTab === 'diagnostico' && (() => {
                // loteVisits is sorted by date ascending in previous step? Wait, let me check how loteVisits is sorted.
                // In IntegradoDetailsModal: const loteVisits = visits.filter(v => v.integradoId === integradoId).sort((a, b) => (a.idade || 0) - (b.idade || 0));
                // So latest is at the end.
                const latestEvalVisit = loteVisits.slice().reverse().find(v => v.avaliacao_tecnica);
                if (!latestEvalVisit || !latestEvalVisit.avaliacao_tecnica) {
                  return (
                    <div className="text-sm text-slate-500 text-center py-8 bg-slate-50 rounded-lg border border-slate-100">
                      Nenhuma avaliação sanitária ou de manejo registrada para este lote.
                    </div>
                  );
                }
                
                const ev = latestEvalVisit.avaliacao_tecnica;
                const parseScore = (val?: number) => {
                  if (!val) return 0;
                  if (val === 1) return 3; // Bom
                  if (val === 2) return 2; // Regular
                  if (val === 3) return 1; // Ruim
                  return 0;
                };

                const radarData = [
                  { subject: 'Limpeza', score: parseScore(ev.granja?.limpeza_baias), fullMark: 3 },
                  { subject: 'Desperdício', score: parseScore(ev.granja?.desperdicio_racao), fullMark: 3 },
                  { subject: 'Ventilação', score: parseScore(ev.granja?.ventilacao_cortinas), fullMark: 3 },
                  { subject: 'Tosse', score: parseScore(ev.suinos?.tosse), fullMark: 3 },
                  { subject: 'Diarreia', score: parseScore(ev.suinos?.diarreia), fullMark: 3 },
                  { subject: 'Uniformidade', score: parseScore(ev.suinos?.uniformidade), fullMark: 3 },
                  { subject: 'Canibalismo', score: parseScore(ev.suinos?.canibalismo), fullMark: 3 },
                ];

                return (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Radar de Saúde e Manejo</h4>
                        <p className="text-xs text-slate-500 mt-1">Visita de {new Date(latestEvalVisit.date + 'T12:00:00').toLocaleDateString('pt-BR')} (Idade: {latestEvalVisit.idade} dias)</p>
                      </div>
                      <div className="text-xs flex gap-3">
                         <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Bom (3)</span>
                         <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Regular (2)</span>
                         <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Ruim (1)</span>
                      </div>
                    </div>
                    
                    <div className="h-72 w-full bg-white rounded-xl border border-slate-100 p-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                          <PolarGrid stroke="#e2e8f0" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 3]} tick={{ fill: '#94a3b8', fontSize: 10 }} tickCount={4} />
                          <Radar name="Pontuação" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                          <Tooltip 
                            formatter={(value: any) => {
                              if (value === 3) return ['Bom', 'Status'];
                              if (value === 2) return ['Regular', 'Status'];
                              if (value === 1) return ['Ruim', 'Status'];
                              return ['Não avaliado', 'Status'];
                            }}
                            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>`;

content = content.replace(oldTab, 'REPLACE_ME');
fs.writeFileSync(filePath, content);
console.log('Tab extracted');
