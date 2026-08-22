import React, { useState, useEffect } from 'react';
import { Visit, Integrado } from '../types';
import { getExpectedConsumption, getActiveCurve } from '../data';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface IntegradoDetailsModalProps {
  integradoId: string;
  visits: Visit[];
  integrados: Integrado[];
  onClose: () => void;
}

export function IntegradoDetailsModal({ integradoId, visits, integrados, onClose }: IntegradoDetailsModalProps) {
  const [showAdherenceInfo, setShowAdherenceInfo] = useState(false);
  const [activeTab, setActiveTab] = useState<'geral' | 'tratamentos'>('geral');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const getIntegradoName = (id: string) => {
    return integrados.find(i => i.id === id)?.name || '';
  };

  const selectedIntegradoDetails = integradoId;

  const lote = integrados.find(i => i.id === integradoId);
  const loteVisits = visits.filter(v => v.integradoId === integradoId).sort((a, b) => (a.idade || 0) - (b.idade || 0));
  
  const maxIdade = Math.max(105, ...(loteVisits.map(v => v.idade || 0)));
  const chartData = [];
  for (let d = 1; d <= maxIdade; d++) {
     const visit = loteVisits.find(v => v.idade === d);
     const esperado = getExpectedConsumption(d, loteVisits[0]?.tipoLote, loteVisits[0]?.pesoAloj, lote?.alojamentoDate, lote?.status, lote?.fechamentoDate, undefined, undefined, loteVisits[0]?.date);
     
     chartData.push({
        idade: d,
        esperado: esperado ? Number(esperado.toFixed(2)) : null,
        real: (visit && visit.consumoAcumuladoReal) ? Number(visit.consumoAcumuladoReal) : null
     });
  }



  const realVisits = chartData.filter(d => d.real !== null && d.real !== undefined);
  const minReal = realVisits.length > 0 ? realVisits[0].idade : 1;
  const maxReal = realVisits.length > 0 ? realVisits[realVisits.length - 1].idade : 1;

  let totalAdherence = 0;
  let validAdherencePoints = 0;
  
  realVisits.forEach(v => {
    if (v.esperado && v.esperado > 0 && v.real !== null && v.real !== undefined) {
      const errorRate = Math.abs(v.real - v.esperado) / v.esperado;
      const adherence = Math.max(0, 100 - (errorRate * 100));
      totalAdherence += adherence;
      validAdherencePoints++;
    }
  });

  const curveAccuracy = validAdherencePoints > 0 ? Math.round(totalAdherence / validAdherencePoints) : null;
  
  let accuracyColorClass = 'bg-blue-100 text-blue-700 border-blue-200';
  if (realVisits.length > 0) {
    const lastVisit = realVisits[realVisits.length - 1];
    if (lastVisit.esperado && lastVisit.real !== null && lastVisit.real !== undefined) {
      const finalDiff = lastVisit.real - lastVisit.esperado;
      if (finalDiff > 5) {
        accuracyColorClass = 'bg-red-100 text-red-700 border-red-200';
      } else if (finalDiff < -5) {
        accuracyColorClass = 'bg-emerald-100 text-emerald-700 border-emerald-200';
      }
    }
  }


        return (
    <div 
      className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">
                Detalhes do Lote: {getIntegradoName(selectedIntegradoDetails)}
              </h3>
              <button 
                onClick={() => onClose()}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            
            <div className="flex border-b border-slate-100 px-6">
              <button 
                onClick={() => setActiveTab('geral')}
                className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'geral' ? 'border-blue-500 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                Visão Geral
              </button>
              <button 
                onClick={() => setActiveTab('tratamentos')}
                className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'tratamentos' ? 'border-blue-500 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                Tratamentos Realizados
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {activeTab === 'geral' && (
              <>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Status</div>
                  <div className="text-sm font-medium text-slate-700">
                    {integrados.find(i => i.id === selectedIntegradoDetails)?.status || 'Desconhecido'}
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Total de Visitas</div>
                  <div className="text-sm font-medium text-slate-700">
                    {visits.filter(v => v.integradoId === selectedIntegradoDetails).length}
                  </div>
                </div>
              </div>
              
              {(() => {
                const loteVisits = visits.filter(v => v.integradoId === selectedIntegradoDetails)
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                const latestVisit = loteVisits.length > 0 ? loteVisits[0] : null;
                const phases = [
                  { id: 'Alojamento', label: 'Alojamento', metaKey: 'metaAlojamento', consKey: 'consumoAlojamento' },
                  { id: 'Crescimento1', label: 'Crescimento 1', metaKey: 'metaCrescimento1', consKey: 'consumoCrescimento1' },
                  { id: 'Crescimento2', label: 'Crescimento 2', metaKey: 'metaCrescimento2', consKey: 'consumoCrescimento2' },
                  { id: 'Crescimento3', label: 'Crescimento 3', metaKey: 'metaCrescimento3', consKey: 'consumoCrescimento3' },
                  { id: 'Terminacao1', label: 'Terminação 1', metaKey: 'metaTerminacao1', consKey: 'consumoTerminacao1' },
                  { id: 'Terminacao2', label: 'Terminação 2', metaKey: 'metaTerminacao2', consKey: 'consumoTerminacao2' },
                ];
                
                return (
                  <>
                    {latestVisit && (
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">Consumo por Fase (Última Visita)</h4>
                        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                          <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500">
                              <tr>
                                <th className="px-4 py-2 font-medium">Fase</th>
                                <th className="px-4 py-2 font-medium">Meta (kg)</th>
                                <th className="px-4 py-2 font-medium">Consumo (kg)</th>
                                <th className="px-4 py-2 font-medium">Desvio (kg)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {phases.map(phase => {
                                const meta = (latestVisit as any)[phase.metaKey];
                                const cons = (latestVisit as any)[phase.consKey];
                                const diff = (cons && meta) ? Number((cons - meta).toFixed(2)) : null;
                                return (
                                  <tr key={phase.id}>
                                    <td className="px-4 py-2 text-slate-700">{phase.label}</td>
                                    <td className="px-4 py-2 text-slate-600">{meta ?? '-'}</td>
                                    <td className={`px-4 py-2 font-medium ${diff !== null && Math.abs(diff) <= 5 ? 'text-blue-600' : diff !== null && diff > 5 ? 'text-red-600' : diff !== null && diff < -5 ? 'text-emerald-600' : 'text-slate-600'}`}>{cons ?? '-'}</td>
                                    <td className={`px-4 py-2 font-medium ${diff !== null && Math.abs(diff) <= 5 ? 'text-blue-600' : diff !== null && diff > 5 ? 'text-red-600' : diff !== null && diff < -5 ? 'text-emerald-600' : 'text-slate-600'}`}>
                                      {diff !== null ? (diff > 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2)) : '-'}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    
                    <h4 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">Histórico de Visitas</h4>
                  </>
                );
              })()}
              <div className="space-y-3">
                <AnimatePresence>
                {visits.filter(v => v.integradoId === selectedIntegradoDetails)
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((visit) => (
                    <motion.div 
                      layout 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }} 
                      key={visit.id} 
                      className="border border-slate-100 rounded-lg p-4 hover:border-slate-200 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-slate-800">
                          {new Date(Number(visit.date.split('-')[0]), Number(visit.date.split('-')[1]) - 1, Number(visit.date.split('-')[2])).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded">
                          Idade: {visit.idade} dias
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        {(() => {
                          const consumoReal = visit.consumoAcumuladoReal;
                          const integrado = integrados.find(i => i.id === visit.integradoId);
                          const consumoEsperado = getExpectedConsumption(visit.idade, visit.tipoLote, visit.pesoAloj, integrado?.alojamentoDate, integrado?.status, integrado?.fechamentoDate, undefined, undefined, visit.date);
                          const diffAcumulado = (consumoReal && consumoEsperado) ? Number((consumoReal - consumoEsperado).toFixed(2)) : null;
                          return (
                            <>
                              <div>
                                <span className="text-slate-500 mr-1">Consumo Real:</span>
                                <span className={`font-semibold ${diffAcumulado !== null && Math.abs(diffAcumulado) <= 5 ? 'text-blue-600' : diffAcumulado !== null && diffAcumulado > 5 ? 'text-red-600' : diffAcumulado !== null && diffAcumulado < -5 ? 'text-emerald-600' : 'text-slate-700'}`}>
                                  {consumoReal !== null && consumoReal !== undefined ? consumoReal.toFixed(2) : '-'} kg
                                  {diffAcumulado !== null && (
                                    <span className="text-xs ml-1 opacity-80">
                                      ({diffAcumulado > 0 ? `+${diffAcumulado.toFixed(2)}` : diffAcumulado.toFixed(2)})
                                    </span>
                                  )}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-500 mr-1">Consumo Esperado:</span>
                                <span className="font-semibold text-slate-700">{consumoEsperado} kg</span>
                              </div>
                            </>
                          );
                        })()}
                        <div>
                          <span className="text-slate-500 mr-1">Animais Alojados:</span>
                          <span className="font-medium text-slate-700">{visit.animaisAlojados ?? '-'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 mr-1">Mortalidade:</span>
                          <span className="font-medium text-slate-700 flex items-center gap-1.5">
                            {visit.animaisMortos ?? '-'}
                            {visit.animaisMortos !== undefined && visit.animaisMortos !== null && visit.animaisAlojados ? (
                              <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                                {((Number(visit.animaisMortos) / Number(visit.animaisAlojados)) * 100).toFixed(2)}%
                              </span>
                            ) : visit.mortalidade ? (
                              <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                                {Number(visit.mortalidade || 0).toFixed(2)}%
                              </span>
                            ) : null}
                          </span>
                        </div>
                      </div>
                      
                      {visit.recomendacao && (
                        <div className="bg-amber-50 text-amber-800 p-3 rounded text-xs leading-relaxed border border-amber-100/50">
                          <strong>Recomendação:</strong><br />
                          {visit.recomendacao}
                        </div>
                      )}
                    </motion.div>
                ))}
                </AnimatePresence>
                {visits.filter(v => v.integradoId === selectedIntegradoDetails).length === 0 && (
                  <div className="text-sm text-slate-500 text-center py-4">Nenhuma visita registrada.</div>
                )}
              </div>
            
              <div className="mt-8 mb-4 border-t border-slate-100 pt-6">
                
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-0">Curva de Consumo do Lote</h4>
                  {curveAccuracy !== null && (
                    <button onClick={() => setShowAdherenceInfo(true)} className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer focus:outline-none" title="Clique para entender o cálculo">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Aderência:</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold border ${accuracyColorClass}`}>
                        {curveAccuracy}%
                      </span>
                    </button>
                  )}
                </div>

                <div className="h-64 w-full bg-white border border-slate-200 rounded-lg p-4">
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
                            return <stop key={index} offset={`${offset}%`} stopColor={color} />;
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
                        formatter={(value) => [`${value} kg`, '']}
                        labelFormatter={(label) => `Idade: ${label} dias`}
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
                        dot={(props: any) => {
                          const { cx, cy, payload, value } = props;
                          if (value === null || value === undefined) return null;
                          
                          let dotColor = '#3b82f6'; // default blue
                          if (payload.esperado !== null && payload.esperado !== undefined) {
                            const diff = payload.real - payload.esperado;
                            if (diff > 5) dotColor = '#ef4444'; // red
                            else if (diff < -5) dotColor = '#10b981'; // emerald
                          }
                          
                          return (
                            <circle cx={cx} cy={cy} r={5} fill={dotColor} stroke="#fff" strokeWidth={2} key={`dot-${payload.idade}`} />
                          );
                        }} 
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
              </>)}

              {activeTab === 'tratamentos' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">Histórico de Tratamentos</h4>
                  {loteVisits.filter(v => v.tratamentos && v.tratamentos.length > 0).length === 0 ? (
                    <div className="text-sm text-slate-500 text-center py-8 bg-slate-50 rounded-lg border border-slate-100">
                      Nenhum tratamento registrado para este lote.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {loteVisits.filter(v => v.tratamentos && v.tratamentos.length > 0).map(visit => (
                        <div key={visit.id} className="border border-slate-200 rounded-lg overflow-hidden">
                          <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                            <span className="text-sm font-semibold text-slate-700">Data da Visita: {new Date(Number(visit.date.split('-')[0]), Number(visit.date.split('-')[1]) - 1, Number(visit.date.split('-')[2])).toLocaleDateString('pt-BR')}</span>
                            <span className="text-xs text-slate-500 font-medium">Idade: {visit.idade} dias</span>
                          </div>
                          <div className="p-4 bg-white">
                            <div className="space-y-3">
                              {visit.tratamentos!.map(t => {
                                  // Recalculate total if missing
                                  let qtTotal = t.quantidadeTotal;
                                  if (!qtTotal || qtTotal <= 0) {
                                      let pesoEstimadoKg = t.pesoEstimadoKg || visit.pesoAmostradoKg || 0;
                                      if (pesoEstimadoKg <= 0) {
                                          const { curve } = getActiveCurve(lote?.alojamentoDate || visit.date, 'Em andamento', visit.tipoLote || 'Misto', undefined, undefined, undefined, visit.date);
                                          const expectedPoint = curve.find((p: any) => p.dia >= (visit.idade || 0));
                                          pesoEstimadoKg = expectedPoint ? expectedPoint.pesoInicial : 0;
                                      }
                                      const animaisTratados = Math.max(0, (visit.animaisAlojados || 0) - (visit.animaisMortos || 0));
                                      const concentracao = t.concentracao && t.concentracao > 0 ? t.concentracao : 100;
                                      const mgTotal = animaisTratados * pesoEstimadoKg * (t.doseMgKg || 0) * (t.duracaoDias || 1);
                                      const produtoConsumidoKg = (mgTotal / 1000000) / (concentracao / 100);
                                      qtTotal = Number((produtoConsumidoKg * 1000).toFixed(2));
                                  }
                                  
                                  return (

                                <div key={t.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-blue-50/50 rounded border border-blue-100/50">
                                  <div>
                                    <div className="font-semibold text-slate-800 text-sm">{t.produto}</div>
                                    {t.motivo && <div className="text-xs text-slate-500 mt-0.5">Motivo: {t.motivo}</div>}
                                  </div>
                                  <div className="flex flex-wrap gap-2 sm:justify-end text-xs">
                                    <span className="bg-white border border-slate-200 px-2 py-1 rounded text-slate-600 font-medium shadow-sm">
                                      Dose: {t.doseMgKg} mg/kg
                                    </span>
                                    <span className="bg-white border border-slate-200 px-2 py-1 rounded text-slate-600 font-medium shadow-sm">
                                      Duração: {t.duracaoDias} dias
                                    </span>
                                    {qtTotal && qtTotal > 0 && (
                                      <span className="bg-blue-100 border border-blue-200 text-blue-800 px-2 py-1 rounded font-bold shadow-sm">
                                        Total: {qtTotal} g
                                      </span>
                                    )}
                                  </div>
                                </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
          </div>
        
      </div>
      {showAdherenceInfo && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAdherenceInfo(false);
          }}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <h4 className="font-semibold text-slate-800">Cálculo de Aderência</h4>
              <button onClick={() => setShowAdherenceInfo(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 text-sm text-slate-600 space-y-4">
              <p>
                A <strong>Aderência</strong> representa o grau de precisão do consumo real em relação à meta de consumo estabelecida pela curva de referência (100% = meta exata).
              </p>
              
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <p className="font-semibold text-slate-700 mb-2 text-xs uppercase tracking-wider">Como calculamos:</p>
                <ol className="list-decimal list-inside space-y-2 text-xs">
                  <li>Para cada visita, calculamos o erro percentual:<br/>
                    <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-blue-600 mt-1 block w-fit">Erro = |Real - Meta| / Meta</code>
                  </li>
                  <li>Calculamos a precisão daquela visita:<br/>
                    <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-emerald-600 mt-1 block w-fit">Aderência = 100% - (Erro * 100)</code>
                  </li>
                  <li>A aderência final é a <strong>Média Aritmética</strong> de todas as visitas do lote.</li>
                </ol>
                
                <div className="bg-white p-3 rounded border border-slate-200 text-xs mt-4">
                  <p className="font-semibold text-slate-700 mb-1">Exemplo prático:</p>
                  <p className="text-slate-600">Se a <strong>Meta</strong> era 100kg e o consumo <strong>Real</strong> foi 90kg:</p>
                  <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-500">
                    <li>Erro: |90 - 100| / 100 = 0.10 (ou 10%)</li>
                    <li>Aderência: 100% - 10% = <strong className="text-emerald-600">90%</strong> de precisão.</li>
                  </ul>
                </div>
              </div>

              <div className="text-xs bg-blue-50 text-blue-800 p-3 rounded border border-blue-100">
                <strong>Nota sobre Cores:</strong> A cor do selo reflete o desvio da <em>última visita</em> (Vermelho {'>'} +5kg, Verde {'<'} -5kg, Azul dentro do limite).
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setShowAdherenceInfo(false)}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-lg transition-colors"
              >
                Entendi
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
