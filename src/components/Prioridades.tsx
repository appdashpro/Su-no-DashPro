import React, { useMemo, useState } from 'react';
import { Integrado, Visit } from '../types';
import { calculatePriority, PriorityScore } from '../lib/priority';
import { AlertCircle, Clock, TrendingDown, Pill, Activity, ChevronRight, Zap, Target, ChevronDown, ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface Props {
  integrados: Integrado[];
  visits: Visit[];
  onNavigateToIntegrado: (integradoId: string) => void;
}

export function Prioridades({ integrados, visits, onNavigateToIntegrado }: Props) {
  const [filter, setFilter] = useState<'all' | 'critical' | 'attention' | 'normal'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const activeIntegrados = integrados.filter(i => i.status === 'Em andamento');

  const allPrioridades = useMemo(() => {
    return activeIntegrados.map(int => {
      const score = calculatePriority(int, visits);
      return { integrado: int, ...score };
    }).sort((a, b) => b.score - a.score);
  }, [activeIntegrados, visits]);

  const prioridades = useMemo(() => {
    if (filter === 'critical') {
      return allPrioridades.filter(item => item.score >= 50);
    } else if (filter === 'attention') {
      return allPrioridades.filter(item => item.score >= 25 && item.score < 50);
    } else if (filter === 'normal') {
      return allPrioridades.filter(item => item.score < 25);
    }
    return allPrioridades;
  }, [allPrioridades, filter]);

  if (activeIntegrados.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-200">
        <Activity className="h-12 w-12 text-slate-300 mb-4" />
        <p className="text-slate-500 font-medium">Nenhum lote em andamento no momento.</p>
      </div>
    );
  }

  // Summary stats
  const totalCount = allPrioridades.length;
  const criticalCount = allPrioridades.filter(p => p.score >= 50).length;
  const attentionCount = allPrioridades.filter(p => p.score >= 25 && p.score < 50).length;
  const normalCount = allPrioridades.filter(p => p.score < 25).length;

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            Prioridades de Visita
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Selecione uma categoria para filtrar os lotes
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`relative overflow-hidden flex flex-col items-start py-2 px-3 rounded-md border transition-all duration-200 ${
              filter === 'all' 
                ? 'bg-slate-800 border-slate-900 shadow-md text-white' 
                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className="flex justify-between w-full items-center mb-1">
              <span className={`text-[10px] font-bold uppercase tracking-wide ${filter === 'all' ? 'text-slate-300' : 'text-slate-500'}`}>Todos Lotes</span>
              <Activity className={`h-3.5 w-3.5 ${filter === 'all' ? 'text-slate-300' : 'text-slate-400'}`} />
            </div>
            <span className="text-lg font-bold leading-none mt-0.5">{totalCount}</span>
          </button>

          <button
            onClick={() => setFilter('critical')}
            className={`relative overflow-hidden flex flex-col items-start py-2 px-3 rounded-md border transition-all duration-200 ${
              filter === 'critical' 
                ? 'bg-red-500 border-red-600 shadow-md text-white' 
                : 'bg-white border-slate-200 hover:border-red-100 hover:bg-red-50 text-slate-700'
            }`}
          >
            {filter === 'critical' && <div className="absolute top-0 right-0 w-10 h-10 bg-red-600 opacity-20 rounded-bl-[30px] z-0"></div>}
            <div className="relative z-10 flex justify-between w-full items-center mb-1">
              <span className={`text-[10px] font-bold uppercase tracking-wide ${filter === 'critical' ? 'text-red-100' : 'text-red-600'}`}>Ação Imediata</span>
              <AlertCircle className={`h-3.5 w-3.5 ${filter === 'critical' ? 'text-red-100' : 'text-red-500'}`} />
            </div>
            <span className="relative z-10 text-lg font-bold leading-none mt-0.5">{criticalCount}</span>
          </button>

          <button
            onClick={() => setFilter('attention')}
            className={`relative overflow-hidden flex flex-col items-start py-2 px-3 rounded-md border transition-all duration-200 ${
              filter === 'attention' 
                ? 'bg-orange-500 border-orange-600 shadow-md text-white' 
                : 'bg-white border-slate-200 hover:border-orange-100 hover:bg-orange-50 text-slate-700'
            }`}
          >
            {filter === 'attention' && <div className="absolute top-0 right-0 w-10 h-10 bg-orange-600 opacity-20 rounded-bl-[30px] z-0"></div>}
            <div className="relative z-10 flex justify-between w-full items-center mb-1">
              <span className={`text-[10px] font-bold uppercase tracking-wide ${filter === 'attention' ? 'text-orange-100' : 'text-orange-600'}`}>Atenção</span>
              <AlertTriangle className={`h-3.5 w-3.5 ${filter === 'attention' ? 'text-orange-100' : 'text-orange-500'}`} />
            </div>
            <span className="relative z-10 text-lg font-bold leading-none mt-0.5">{attentionCount}</span>
          </button>

          <button
            onClick={() => setFilter('normal')}
            className={`relative overflow-hidden flex flex-col items-start py-2 px-3 rounded-md border transition-all duration-200 ${
              filter === 'normal' 
                ? 'bg-emerald-500 border-emerald-600 shadow-md text-white' 
                : 'bg-white border-slate-200 hover:border-emerald-100 hover:bg-emerald-50 text-slate-700'
            }`}
          >
            {filter === 'normal' && <div className="absolute top-0 right-0 w-10 h-10 bg-emerald-600 opacity-20 rounded-bl-[30px] z-0"></div>}
            <div className="relative z-10 flex justify-between w-full items-center mb-1">
              <span className={`text-[10px] font-bold uppercase tracking-wide ${filter === 'normal' ? 'text-emerald-100' : 'text-emerald-600'}`}>Normal</span>
              <ShieldCheck className={`h-3.5 w-3.5 ${filter === 'normal' ? 'text-emerald-100' : 'text-emerald-500'}`} />
            </div>
            <span className="relative z-10 text-lg font-bold leading-none mt-0.5">{normalCount}</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-12">#</th>
                <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Integrado & Lote</th>
                <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Score</th>
                <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Métricas Chave</th>
                <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {prioridades.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500 text-sm">
                    Nenhum lote encontrado com este filtro.
                  </td>
                </tr>
              ) : (
                prioridades.map((item, index) => {
                  const safeAge = isNaN(item.age) ? 0 : item.age;
                  const progressPct = Math.min(100, Math.round((safeAge / 105) * 100) || 0);
                  const isExpanded = expandedId === item.integrado.id;
                  
                  return (
                    <React.Fragment key={item.integrado.id}>
                      <tr 
                        onClick={(e) => toggleExpand(item.integrado.id, e)}
                        className={`cursor-pointer transition-colors ${
                          isExpanded ? 'bg-slate-50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="px-5 py-5">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm border ${
                            item.score >= 50 ? 'bg-red-50 text-red-700 border-red-200' : 
                            item.score >= 25 ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                            'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {index + 1}
                          </div>
                        </td>
                        <td className="px-5 py-5">
                          <div className="font-bold text-slate-800">{item.integrado.name}</div>
                          
                          <div className="flex items-center gap-2 mt-2">
                            <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500" style={{ width: `${progressPct}%` }}></div>
                            </div>
                            <span className="text-xs font-semibold text-slate-500">{safeAge}d</span>
                          </div>
                        </td>
                        <td className="px-5 py-5 text-center">
                          <div className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg border font-bold ${
                            item.score >= 50 ? 'bg-red-50 border-red-200 text-red-700' : 
                            item.score >= 25 ? 'bg-orange-50 border-orange-200 text-orange-700' : 
                            'bg-emerald-50 border-emerald-200 text-emerald-700'
                          }`}>
                            {item.score}
                          </div>
                        </td>
                        <td className="px-5 py-5 min-w-[200px]">
                          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
                            <div className="flex items-center gap-1.5" title="Dias sem visita">
                              <Clock className={`h-3.5 w-3.5 ${item.daysSinceLastVisit === null || item.daysSinceLastVisit > 7 ? 'text-red-500' : item.daysSinceLastVisit === 0 ? 'text-emerald-500' : 'text-slate-400'}`} />
                              <span className={item.daysSinceLastVisit === null || item.daysSinceLastVisit > 7 ? 'text-red-700 font-bold' : item.daysSinceLastVisit === 0 ? 'text-emerald-700 font-medium' : 'text-slate-600 font-medium'}>
                                {item.daysSinceLastVisit === null ? 'Sem visita' : item.daysSinceLastVisit === 0 ? 'Hoje' : `${item.daysSinceLastVisit}d`}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5" title="Desvio de Consumo">
                              <TrendingDown className={`h-3.5 w-3.5 ${item.feedDeviation !== null && item.feedDeviation < -2 ? 'text-red-500' : 'text-slate-400'}`} />
                              <span className={item.feedDeviation !== null && item.feedDeviation < -2 ? 'text-red-700 font-bold' : 'text-slate-600 font-medium'}>
                                {item.feedDeviation !== null ? `${item.feedDeviation > 0 ? '+' : ''}${item.feedDeviation.toFixed(2)}kg` : 'N/A'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5" title="Mortalidade Atual">
                              <Activity className={`h-3.5 w-3.5 ${item.mortality >= 2.5 ? 'text-red-500' : 'text-slate-400'}`} />
                              <span className={item.mortality >= 2.5 ? 'text-red-700 font-bold' : 'text-slate-600 font-medium'}>
                                {item.mortality.toFixed(2)}%
                              </span>
                            </div>
                            {item.treatmentsCount > 0 && (
                              <div className="flex items-center gap-1.5" title="Tratamentos">
                                <Pill className="h-3.5 w-3.5 text-orange-500" />
                                <span className="text-orange-700 font-bold">
                                  {item.treatmentsCount}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-5">
                          {item.smartActions.length > 0 ? (
                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-md ${
                              item.score >= 50 ? 'bg-red-50 text-red-700' : 
                              item.score >= 25 ? 'bg-orange-50 text-orange-700' : 
                              'bg-blue-50 text-blue-700'
                            }`}>
                              <Target className="h-3.5 w-3.5" />
                              {item.smartActions.length} ações indicadas
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-md bg-emerald-50 text-emerald-700">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Tudo certo
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-5 text-right">
                          <button 
                            className="p-2 rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                            title="Expandir detalhes"
                          >
                            <ChevronDown className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        </td>
                      </tr>
                      
                      {/* Expanded Details Row */}
                      {isExpanded && (
                        <tr className="bg-slate-50/70 border-b border-slate-100">
                          <td colSpan={6} className="px-5 py-6">
                            <div className="ml-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div>
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                  <AlertCircle className="h-3.5 w-3.5" /> Alertas Detectados
                                </h4>
                                {item.reasons.length > 0 ? (
                                  <ul className="space-y-3">
                                    {item.reasons.map((reason, i) => (
                                      <li key={i} className="text-sm font-medium text-slate-700 flex items-start gap-2">
                                        <span className="text-slate-400 mt-0.5">•</span>
                                        <span>{reason}</span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-slate-500 italic">Nenhum alerta crítico para este lote.</p>
                                )}
                              </div>
                              
                              <div>
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                  <Target className="h-3.5 w-3.5" /> Ações Recomendadas
                                </h4>
                                {item.smartActions.length > 0 ? (
                                  <ul className="space-y-3 mb-6">
                                    {item.smartActions.map((action, i) => (
                                      <li key={i} className="text-sm font-semibold text-slate-800 flex items-start gap-2">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                                        <span>{action}</span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-emerald-600 font-medium mb-6">Manter rotina padrão de acompanhamento.</p>
                                )}
                                
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onNavigateToIntegrado(item.integrado.id);
                                  }}
                                  className="inline-flex items-center gap-2 py-2 px-4 text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-sm font-bold rounded-lg transition-colors border border-blue-200 bg-white shadow-sm"
                                >
                                  Ver Detalhes do Lote
                                  <ArrowRight className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
