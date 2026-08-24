const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src', 'components', 'IntegradoDetailsModal.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const newTab = `              {activeTab === 'diagnostico' && (() => {
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

                const validScores = radarData.filter(d => d.score > 0);
                const totalScore = validScores.reduce((sum, d) => sum + d.score, 0);
                const maxPossibleScore = validScores.length * 3;
                const healthIndex = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;

                let healthColor = 'text-slate-800';
                let healthBg = 'bg-slate-100';
                let healthBorder = 'border-slate-200';
                let healthStatus = 'Não Avaliado';
                let radarColor = '#94a3b8'; // Slate
                let radarFillOpacity = 0.4;

                if (healthIndex >= 85) {
                  healthColor = 'text-emerald-700';
                  healthBg = 'bg-emerald-100';
                  healthBorder = 'border-emerald-200';
                  healthStatus = 'Excelente (Poucos ou nenhum risco)';
                  radarColor = '#10b981'; // Emerald
                } else if (healthIndex >= 65) {
                  healthColor = 'text-amber-700';
                  healthBg = 'bg-amber-100';
                  healthBorder = 'border-amber-200';
                  healthStatus = 'Atenção (Requer monitoramento)';
                  radarColor = '#f59e0b'; // Amber
                } else if (healthIndex > 0) {
                  healthColor = 'text-red-700';
                  healthBg = 'bg-red-100';
                  healthBorder = 'border-red-200';
                  healthStatus = 'Crítico (Ação imediata necessária)';
                  radarColor = '#ef4444'; // Red
                  radarFillOpacity = 0.6;
                }

                return (
                  <div className="space-y-6">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Índice Sanitário Global</h4>
                          <span className={\`text-xs font-bold px-2 py-0.5 rounded-md \${healthBg} \${healthColor} border \${healthBorder}\`}>
                            {Math.round(healthIndex)}%
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">Última avaliação: {new Date(latestEvalVisit.date + 'T12:00:00').toLocaleDateString('pt-BR')} (Idade: {latestEvalVisit.idade} dias)</p>
                      </div>
                      <div className="text-sm font-medium text-slate-600 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
                        Status: <strong className={healthColor}>{healthStatus}</strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 h-[350px] w-full bg-white rounded-xl border border-slate-200 shadow-sm p-4 relative">
                        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10 pointer-events-none">
                          <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider bg-white/80 backdrop-blur-sm px-2 py-1 rounded">Radar de Saúde e Manejo</h4>
                          <div className="text-[10px] flex flex-col gap-1.5 bg-white/90 backdrop-blur-sm p-2 rounded-lg border border-slate-100 shadow-sm">
                             <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Bom (3 pontos)</span>
                             <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Regular (2 pontos)</span>
                             <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Ruim (1 ponto)</span>
                          </div>
                        </div>
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 3]} tick={{ fill: '#94a3b8', fontSize: 10 }} tickCount={4} />
                            <Radar name="Pontuação" dataKey="score" stroke={radarColor} strokeWidth={2} fill={radarColor} fillOpacity={radarFillOpacity} />
                            <Tooltip 
                              formatter={(value: any) => {
                                if (value === 3) return ['Bom (Baixo Risco)', 'Avaliação'];
                                if (value === 2) return ['Regular (Risco Moderado)', 'Avaliação'];
                                if (value === 1) return ['Ruim (Alto Risco)', 'Avaliação'];
                                return ['Não avaliado', 'Avaliação'];
                              }}
                              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <div className="flex flex-col gap-4">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm h-full">
                          <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">Como Interpretar o Gráfico</h4>
                          <div className="space-y-3 text-xs text-slate-600">
                            <p>O radar mapeia 7 indicadores chave de saúde e ambiência. <strong>Quanto mais preenchido o gráfico (pontas mais longas), mais saudável está o lote.</strong></p>
                            
                            <div className="space-y-2 pt-2 border-t border-slate-200">
                              <p className="font-semibold text-slate-700">Critério de Cores (Índice):</p>
                              <div className="flex items-start gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1"></span>
                                <p><strong className="text-emerald-700">Verde (&ge; 85%)</strong>: O gráfico se expande até as bordas. Indica conformidade com as boas práticas.</p>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1"></span>
                                <p><strong className="text-amber-700">Amarelo (65% - 84%)</strong>: O radar tem "recuos". Há pontos de atenção (ex: tosse leve, ventilação inadequada) que podem impactar o ganho de peso.</p>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1"></span>
                                <p><strong className="text-red-700">Vermelho (&lt; 65%)</strong>: O gráfico fica contraído no centro. Indica múltiplos fatores graves ocorrendo simultaneamente, exigindo ação curativa ou ajuste severo de manejo.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>`;

content = content.replace('REPLACE_ME', newTab);
fs.writeFileSync(filePath, content);
console.log('Update complete');
