import React, { useState, useEffect } from 'react';
import { Visit, Integrado } from '../types';
import { getExpectedConsumption, getActiveCurve } from '../data';
import { getEmpresaConfigsLocal } from '../lib/storage';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { ComposedChart, Line, Area, Bar, BarChart, ReferenceLine, Label, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Cell } from 'recharts';

interface IntegradoDetailsModalProps {
  integradoId: string;
  visits: Visit[];
  integrados: Integrado[];
  onClose: () => void;
}

export function IntegradoDetailsModal({ integradoId, visits, integrados, onClose }: IntegradoDetailsModalProps) {
  const [showAdherenceInfo, setShowAdherenceInfo] = useState(false);
  const [showDiagInfo, setShowDiagInfo] = useState(false);
  const [activeTab, setActiveTab] = useState<'geral' | 'tratamentos' | 'diagnostico'>('geral');
  const [selectedDiagVisitId, setSelectedDiagVisitId] = useState<string>('average');

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
  const configs = getEmpresaConfigsLocal();
  const currentConfig = configs.find((c: any) => c.empresa_id === lote?.empresaId);
  const finalMetaMortalidade = (currentConfig?.meta_mortalidade !== undefined && currentConfig?.meta_mortalidade !== null) ? currentConfig.meta_mortalidade : 0.5;

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

  const activeCurveInfo = getActiveCurve(lote?.alojamentoDate, lote?.status, loteVisits[0]?.tipoLote, lote?.fechamentoDate, undefined, loteVisits[0]?.curva_consumo_id, loteVisits[0]?.date) || {};
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
      if (chartData[i].esperado !== null && chartData[i].esperado! >= accum) {
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
  const mortalityData = [];
  for (let d = 1; d <= maxIdade; d++) {
    const visit = loteVisits.find(v => v.idade === d);
    const proportionalMeta = Number(finalMetaMortalidade);
    if (visit) {
      const alojados = visit.animaisAlojados || loteVisits[0]?.animaisAlojados || 1;
      const mortos = visit.animaisMortos || 0;
      const descartes = visit.descartesPeriodo || 0;
      const mortosPerc = Number(((mortos / alojados) * 100).toFixed(2));
      const descartesPerc = Number(((descartes / alojados) * 100).toFixed(2));
      mortalityData.push({
        idade: d,
        mortos: mortosPerc,
        descartes: descartesPerc,
        total: Number((mortosPerc + descartesPerc).toFixed(2)),
        meta: proportionalMeta,
        date: visit.date
      });
    } else {
      mortalityData.push({
        idade: d,
        mortos: null,
        descartes: null,
        total: null,
        meta: proportionalMeta,
        date: null
      });
    }
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
  
  let accuracyColorClass = 'bg-slate-100 text-slate-700 border-slate-200';
  let accuracyStatus = '';
  
  if (curveAccuracy !== null) {
    if (curveAccuracy >= 95) {
      accuracyColorClass = 'bg-emerald-100 text-emerald-700 border-emerald-200';
      accuracyStatus = 'Excelente';
    } else if (curveAccuracy >= 90) {
      accuracyColorClass = 'bg-amber-100 text-amber-700 border-amber-200';
      accuracyStatus = 'Atenção';
    } else {
      accuracyColorClass = 'bg-red-100 text-red-700 border-red-200';
      accuracyStatus = 'Crítico';
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
              <button 
                onClick={() => setActiveTab('diagnostico')}
                className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'diagnostico' ? 'border-blue-500 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                Diagnóstico Sanitário
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {activeTab === 'geral' && (
              <>
              {(() => {
                const loteVisitsAsc = visits.filter(v => v.integradoId === selectedIntegradoDetails)
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                const latestVisit = loteVisitsAsc.length > 0 ? loteVisitsAsc[loteVisitsAsc.length - 1] : null;
                const totalRacao = latestVisit?.volumeTotalCargas || 0;
                const alojados = latestVisit?.animaisAlojados || loteVisitsAsc[0]?.animaisAlojados || 0;
                const mortos = latestVisit?.animaisMortos || 0;
                const descartes = latestVisit?.descartesPeriodo || 0;
                const vivos = Math.max(0, alojados - mortos - descartes);

                let mortPercent = 0;
                if (latestVisit?.animaisMortos && alojados > 0) {
                   mortPercent = (latestVisit.animaisMortos / alojados) * 100;
                } else if (latestVisit?.mortalidade) {
                   mortPercent = latestVisit.mortalidade;
                }
                const idade = latestVisit?.idade || 0;

                const consumoRealCab = latestVisit?.consumoAcumuladoReal !== undefined && latestVisit?.consumoAcumuladoReal !== null
                  ? Number(latestVisit.consumoAcumuladoReal)
                  : (totalRacao > 0 && vivos > 0 ? Number((totalRacao / vivos).toFixed(2)) : undefined);

                const consumoEsperado = (idade > 0 && latestVisit)
                  ? getExpectedConsumption(idade, latestVisit.tipoLote, latestVisit.pesoAloj, lote?.alojamentoDate, lote?.status, lote?.fechamentoDate, undefined, undefined, latestVisit.date)
                  : null;

                const diffConsumo = (consumoRealCab !== undefined && consumoEsperado !== null)
                  ? Number((consumoRealCab - consumoEsperado).toFixed(2))
                  : null;

                const getFase = (dias: number) => {
                  if (dias <= 0) return 'Alojamento';
                  if (dias <= 21) return 'Alojamento (Pré)';
                  if (dias <= 63) return 'Crescimento';
                  return 'Terminação';
                };

                return (
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
                     <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                       <div>
                         <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Consumo Médio (Acum.)</div>
                         <div className="text-lg font-bold text-slate-800">
                           {consumoRealCab !== undefined ? `${consumoRealCab.toFixed(1)} kg/cab` : '-'}
                         </div>
                       </div>
                       <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                         <span className="text-slate-500 break-words line-clamp-2" title={consumoEsperado !== null ? `Meta: ${consumoEsperado.toFixed(1)} kg/cab` : ''}>
                           {consumoEsperado !== null ? `Meta: ${consumoEsperado.toFixed(1)} kg/cab` : 'Sem meta'}
                         </span>
                         {diffConsumo !== null && (
                           <span className={`font-semibold ml-1 shrink-0 ${Math.abs(diffConsumo) <= 1 ? 'text-emerald-600' : diffConsumo > 1 ? 'text-red-600' : 'text-blue-600'}`} title="Diferença p/ Meta">
                             {diffConsumo > 0 ? `+${diffConsumo.toFixed(1)}` : diffConsumo.toFixed(1)} kg
                           </span>
                         )}
                       </div>
                     </div>

                     <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                       <div>
                         <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Mortalidade Acum.</div>
                         <div className="text-lg font-bold text-slate-800">{mortPercent > 0 ? `${mortPercent.toFixed(2)}%` : '-'}</div>
                       </div>
                       <div className="mt-2 pt-1.5 border-t border-slate-200/60 text-[11px] text-slate-500 break-words line-clamp-2">
                         {alojados > 0 ? `${vivos.toLocaleString('pt-BR')} vivos (${mortos} mortos)` : 'Sem contagem'}
                       </div>
                     </div>

                     <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                       <div>
                         <div className="flex justify-between items-center mb-0.5">
                           <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Aderência</div>
                           {curveAccuracy !== null && (
                              <button onClick={() => setShowAdherenceInfo(true)} className="text-[10px] text-blue-600 font-semibold hover:underline">Info</button>
                           )}
                         </div>
                         <div className="flex items-baseline gap-2">
                           <div className={`text-lg font-bold ${accuracyColorClass.replace('bg-', 'text-').replace('-100', '-600').split(' ')[1] || 'text-slate-800'}`}>
                             {curveAccuracy !== null ? `${curveAccuracy}%` : '-'}
                           </div>
                           {accuracyStatus && (
                             <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${accuracyColorClass}`}>
                               {accuracyStatus}
                             </span>
                           )}
                         </div>
                       </div>
                       <div className="mt-2 pt-1.5 border-t border-slate-200/60 text-[11px] text-slate-500 break-words line-clamp-2">
                         Meta: 100% (Consumo vs. Curva)
                       </div>
                     </div>

                     <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                       <div>
                         <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Idade Atual</div>
                         <div className="text-lg font-bold text-slate-800">{idade > 0 ? `${idade} dias` : '-'}</div>
                       </div>
                       <div className="mt-2 pt-1.5 border-t border-slate-200/60 text-[11px] text-slate-500 font-medium text-slate-600 break-words line-clamp-2">
                         {lote?.status === 'Fechado' ? 'Encerrado' : getFase(idade)}
                       </div>
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
                    <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
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
                             const diff = (Number(value) - Number(props.payload.esperado)).toFixed(2);
                             return [`${value} kg (${Number(diff) > 0 ? '+' : ''}${diff} kg)`, name];
                          }
                          return [`${value} kg`, name];
                        }}
                        labelFormatter={(label) => `Idade: ${label} dias`}
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
                          return <circle key={`dot-${payload.idade}`} cx={cx} cy={cy} r={4} fill={dotColor} stroke="#fff" strokeWidth={1.5} />;
                        }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="mb-8 mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-0">Mortalidade (Surtos e Picos)</h4>
                </div>
                <div className="h-64 w-full bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={mortalityData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      {phaseMilestones.map((pm, i) => (
                        <ReferenceLine key={i} x={pm.idade} stroke="#cbd5e1" strokeDasharray="3 3">
                           <Label value={pm.label} position="insideTopRight" offset={10} fill="#94a3b8" fontSize={10} />
                        </ReferenceLine>
                      ))}
                      <XAxis dataKey="idade" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} minTickGap={20} />
                      <YAxis domain={[0, (dataMax: number) => Math.max(Math.ceil(dataMax * 1.2), Math.ceil(finalMetaMortalidade * 1.5), 5)]} tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={(tick) => `${tick}%`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                        labelStyle={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}
                        formatter={(value: any, name: any) => [`${value}%`, String(name)]}
                        labelFormatter={(label) => `Idade: ${label} dias`}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar dataKey="mortos" name="Mortos" stackId="a" radius={[4, 4, 0, 0]} barSize={28}>
                        {mortalityData.map((entry, index) => {
                          if (entry.mortos === null) return <Cell key={`m-${index}`} fill="#94a3b8" />;
                          const diff = entry.mortos - entry.meta;
                          let color = '#3b82f6'; // Azul
                          if (diff > 0.05) color = '#ef4444'; // Vermelho
                          else if (diff < -0.05) color = '#10b981'; // Verde
                          return <Cell key={`m-${index}`} fill={color} />;
                        })}
                      </Bar>
                      <Line type="monotone" dataKey="meta" name={`Meta (${finalMetaMortalidade}%)`} stroke="#94a3b8" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <h4 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">Histórico de Visitas</h4>

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
              {activeTab === 'diagnostico' && (() => {
                const evalVisits = loteVisits.filter(v => v.avaliacao_tecnica);
                if (evalVisits.length === 0) {
                  return (
                    <div className="text-sm text-slate-500 text-center py-8 bg-slate-50 rounded-lg border border-slate-100">
                      Nenhuma avaliação sanitária ou de manejo registrada para este lote.
                    </div>
                  );
                }

                const parseScore = (val?: number) => {
                  if (!val) return 0;
                  if (val === 1) return 3; // Bom
                  if (val === 2) return 2; // Regular
                  if (val === 3) return 1; // Ruim
                  return 0;
                };

                let radarData: any[] = [];
                let displayTitle = '';
                let displaySubtitle = '';

                if (selectedDiagVisitId === 'average') {
                  const aggregated: Record<string, { total: number, count: number }> = {
                    'Limpeza': { total: 0, count: 0 },
                    'Desperdício': { total: 0, count: 0 },
                    'Ventilação': { total: 0, count: 0 },
                    'Tosse': { total: 0, count: 0 },
                    'Diarreia': { total: 0, count: 0 },
                    'Uniformidade': { total: 0, count: 0 },
                    'Canibalismo': { total: 0, count: 0 },
                  };

                  evalVisits.forEach(v => {
                    const ev = v.avaliacao_tecnica!;
                    const scores = {
                      'Limpeza': parseScore(ev.granja?.limpeza_baias),
                      'Desperdício': parseScore(ev.granja?.desperdicio_racao),
                      'Ventilação': parseScore(ev.granja?.ventilacao_cortinas),
                      'Tosse': parseScore(ev.suinos?.tosse),
                      'Diarreia': parseScore(ev.suinos?.diarreia),
                      'Uniformidade': parseScore(ev.suinos?.uniformidade),
                      'Canibalismo': parseScore(ev.suinos?.canibalismo),
                    };

                    Object.entries(scores).forEach(([key, score]) => {
                      if (score > 0) {
                        aggregated[key].total += score;
                        aggregated[key].count += 1;
                      }
                    });
                  });

                  radarData = Object.entries(aggregated).map(([subject, data]) => ({
                    subject,
                    score: data.count > 0 ? (data.total / data.count) : 0,
                    fullMark: 3
                  }));

                  displayTitle = 'Média do Lote';
                  displaySubtitle = `Baseado em ${evalVisits.length} avaliações`;
                } else {
                  const selectedVisit = evalVisits.find(v => v.id === selectedDiagVisitId);
                  if (selectedVisit && selectedVisit.avaliacao_tecnica) {
                    const ev = selectedVisit.avaliacao_tecnica;
                    radarData = [
                      { subject: 'Limpeza', score: parseScore(ev.granja?.limpeza_baias), fullMark: 3 },
                      { subject: 'Desperdício', score: parseScore(ev.granja?.desperdicio_racao), fullMark: 3 },
                      { subject: 'Ventilação', score: parseScore(ev.granja?.ventilacao_cortinas), fullMark: 3 },
                      { subject: 'Tosse', score: parseScore(ev.suinos?.tosse), fullMark: 3 },
                      { subject: 'Diarreia', score: parseScore(ev.suinos?.diarreia), fullMark: 3 },
                      { subject: 'Uniformidade', score: parseScore(ev.suinos?.uniformidade), fullMark: 3 },
                      { subject: 'Canibalismo', score: parseScore(ev.suinos?.canibalismo), fullMark: 3 },
                    ];
                    displayTitle = `Visita Específica`;
                    displaySubtitle = `${new Date(selectedVisit.date + 'T12:00:00').toLocaleDateString('pt-BR')} (Idade: ${selectedVisit.idade} dias)`;
                  } else {
                    radarData = [
                      { subject: 'Limpeza', score: 0, fullMark: 3 },
                      { subject: 'Desperdício', score: 0, fullMark: 3 },
                      { subject: 'Ventilação', score: 0, fullMark: 3 },
                      { subject: 'Tosse', score: 0, fullMark: 3 },
                      { subject: 'Diarreia', score: 0, fullMark: 3 },
                      { subject: 'Uniformidade', score: 0, fullMark: 3 },
                      { subject: 'Canibalismo', score: 0, fullMark: 3 },
                    ];
                    displayTitle = 'Avaliação não encontrada';
                    displaySubtitle = '-';
                  }
                }

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
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Índice Sanitário Global</h4>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${healthBg} ${healthColor} border ${healthBorder}`}>
                            {Math.round(healthIndex)}%
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{displayTitle} {displaySubtitle ? `- ${displaySubtitle}` : ''}</p>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full md:w-auto">
                        <div className="text-sm font-medium text-slate-600 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm whitespace-nowrap">
                          Status: <strong className={healthColor}>{healthStatus}</strong>
                        </div>
                        <select
                          className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[180px] w-full sm:w-auto font-medium"
                          value={selectedDiagVisitId}
                          onChange={(e) => setSelectedDiagVisitId(e.target.value)}
                        >
                          <option value="average">Média do Lote</option>
                          {evalVisits.slice().reverse().map(v => (
                            <option key={v.id} value={v.id}>
                              Visita: {new Date(v.date + 'T12:00:00').toLocaleDateString('pt-BR')} ({v.idade}d)
                            </option>
                          ))}
                        </select>
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
                        <div className="bg-slate-50 rounded-xl border border-slate-200 shadow-sm h-fit">
                          <button 
                            onClick={() => setShowDiagInfo(!showDiagInfo)}
                            className="w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-slate-100 rounded-xl"
                          >
                            <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Como Interpretar o Gráfico</h4>
                            {showDiagInfo ? <ChevronUp size={18} className="text-slate-500" /> : <ChevronDown size={18} className="text-slate-500" />}
                          </button>
                          
                          <AnimatePresence>
                            {showDiagInfo && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="p-4 pt-0 space-y-3 text-xs text-slate-600">
                                  <p>O radar mapeia 7 indicadores chave de saúde e ambiência. <strong>Quanto mais preenchido o gráfico (pontas mais longas), mais saudável está o lote.</strong></p>
                                  
                                  <div className="space-y-2 pt-3 border-t border-slate-200">
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
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-lg border border-slate-100 p-4">
                      <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">Recomendações Recentes</h4>
                      <div className="space-y-3">
                        {loteVisits.slice(-3).reverse().map(v => (
                          v.recomendacao ? (
                            <div key={v.id} className="text-sm border-l-2 border-blue-400 pl-3 py-1">
                              <span className="text-xs font-semibold text-slate-500 block mb-1">
                                {new Date(v.date + 'T12:00:00').toLocaleDateString('pt-BR')} - {v.idade} dias
                              </span>
                              <p className="text-slate-700">{v.recomendacao}</p>
                            </div>
                          ) : null
                        ))}
                        {loteVisits.filter(v => v.recomendacao).length === 0 && (
                          <div className="text-sm text-slate-500 italic">Nenhuma recomendação registrada nas últimas visitas.</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
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

              <div className="text-xs bg-slate-50 text-slate-700 p-3 rounded border border-slate-200 space-y-2">
                <p className="font-semibold text-slate-800 border-b border-slate-200 pb-1 mb-2">Critério de Cores e Gravidade (Média do Lote):</p>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0"></span>
                  <p><strong>Excelente (Verde):</strong> Aderência <strong>&ge; 95%</strong>. O lote está consumindo de forma ideal e previsível.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0"></span>
                  <p><strong>Atenção (Amarelo):</strong> Aderência <strong>entre 90% e 94%</strong>. Há desvios moderados (desperdício ou baixo consumo).</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 shrink-0"></span>
                  <p><strong>Crítico (Vermelho):</strong> Aderência <strong>&lt; 90%</strong>. Alerta severo de saúde (baixo consumo) ou desperdício extremo (alto consumo).</p>
                </div>
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
