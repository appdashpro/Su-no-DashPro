import React, { useRef, useState } from 'react';
import { Visit, Integrado } from '../types';
import { getExpectedConsumption, getActiveCurve } from '../data';
import { getEmpresaConfigsLocal } from '../lib/storage';
import { X, FileDown, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, ReferenceLine, Label, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

interface LoteReportModalProps {
  integradoId: string;
  visits: Visit[];
  integrados: Integrado[];
  onClose: () => void;
}

export function LoteReportModal({ integradoId, visits, integrados, onClose }: LoteReportModalProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const lote = integrados.find(i => i.id === integradoId);
  const configs = getEmpresaConfigsLocal();
  const currentConfig = configs.find((c: any) => c.empresa_id === lote?.empresaId);
  const finalMetaMortalidade = currentConfig?.meta_mortalidade || 0.5;

  const loteVisits = visits.filter(v => v.integradoId === integradoId).sort((a, b) => (a.idade || 0) - (b.idade || 0));
  const latestVisit = loteVisits.length > 0 ? loteVisits[loteVisits.length - 1] : null;

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

  const realVisits = chartData.filter(d => d.real !== null && d.real !== undefined);
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
  
  // Health Index calculation
  const latestEvalVisit = loteVisits.slice().reverse().find(v => v.avaliacao_tecnica);
  const ev = latestEvalVisit?.avaliacao_tecnica;
  const parseScore = (val?: number) => {
    if (!val) return 0;
    if (val === 1) return 3;
    if (val === 2) return 2;
    if (val === 3) return 1;
    return 0;
  };
  const radarData = [
    { subject: 'Limpeza', score: parseScore(ev?.granja?.limpeza_baias) },
    { subject: 'Desperdício', score: parseScore(ev?.granja?.desperdicio_racao) },
    { subject: 'Ventilação', score: parseScore(ev?.granja?.ventilacao_cortinas) },
    { subject: 'Tosse', score: parseScore(ev?.suinos?.tosse) },
    { subject: 'Diarreia', score: parseScore(ev?.suinos?.diarreia) },
    { subject: 'Uniform.', score: parseScore(ev?.suinos?.uniformidade) },
    { subject: 'Canibalismo', score: parseScore(ev?.suinos?.canibalismo) },
  ];
  const validScores = radarData.filter(d => d.score > 0);
  const totalScore = validScores.reduce((sum, d) => sum + d.score, 0);
  const healthIndex = (validScores.length * 3) > 0 ? Math.round((totalScore / (validScores.length * 3)) * 100) : 0;

  // Basic stats
  const totalRacao = latestVisit?.volumeTotalCargas || 0;
  const alojados = latestVisit?.animaisAlojados || loteVisits[0]?.animaisAlojados || 0;
  const mortos = latestVisit?.animaisMortos || 0;
  const descartes = latestVisit?.descartesPeriodo || 0;
  const vivos = Math.max(0, alojados - mortos - descartes);
  const mortPercent = alojados > 0 ? ((mortos / alojados) * 100).toFixed(2) : '-';
  const consumoRealCab = (latestVisit?.consumoAcumuladoReal !== undefined && latestVisit?.consumoAcumuladoReal !== null)
    ? Number(latestVisit.consumoAcumuladoReal)
    : (totalRacao > 0 && vivos > 0 ? Number((totalRacao / vivos).toFixed(2)) : undefined);
  const consumoEsperado = (latestVisit && maxIdade > 0)
    ? getExpectedConsumption(maxIdade, latestVisit.tipoLote, latestVisit.pesoAloj, lote?.alojamentoDate, lote?.status, lote?.fechamentoDate, undefined, undefined, latestVisit.date)
    : null;

  const handleDownload = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Relatorio_Fechamento_${lote?.name.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error(err);
      alert('Erro ao gerar PDF.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-100 rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-full overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileDown className="text-blue-600" size={20} /> {lote?.status === 'Fechado' ? 'Relatório de Fechamento de Lote' : 'Relatório Parcial de Lote'}
          </h2>
          <div className="flex gap-2">
            <button 
              onClick={handleDownload}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <FileDown size={18} />}
              {isGenerating ? 'Gerando PDF...' : 'Baixar PDF'}
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center bg-slate-100">
          {/* A4 Wrapper for preview and capture */}
          <div 
            ref={reportRef} 
            className="bg-white shadow-sm"
            style={{ width: '794px', minHeight: '1123px', padding: '40px', boxSizing: 'border-box' }}
          >
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-6">
              <div>
                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-1">DashPro</h1>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Relatório Analítico de Lote</p>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold text-slate-800 mb-1">{lote?.name}</h2>
                <p className="text-sm text-slate-600"><strong>Data Alojamento:</strong> {new Date((lote?.alojamentoDate||'') + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                <p className="text-sm text-slate-600">{lote?.fechamentoDate && <React.Fragment><strong>Data Fechamento:</strong> {new Date(lote.fechamentoDate + 'T12:00:00').toLocaleDateString('pt-BR')}</React.Fragment>}</p>
                <p className="text-sm font-semibold text-slate-700 mt-1">Duração Total: {maxIdade} dias</p>
              </div>
            </div>

            {/* KPIs Grid */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Mortalidade</p>
                <p className="text-xl font-black text-slate-800">{mortPercent}%</p>
                <p className="text-xs text-slate-500 mt-1">{mortos} mortos / {alojados} aloj.</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Consumo Médio</p>
                <p className="text-xl font-black text-slate-800">{consumoRealCab?.toFixed(1) || '-'} <span className="text-xs font-normal">kg/cab</span></p>
                <p className="text-xs text-slate-500 mt-1">Meta: {consumoEsperado?.toFixed(1) || '-'} kg</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Aderência</p>
                <p className="text-xl font-black text-slate-800">{curveAccuracy !== null ? `${curveAccuracy}%` : '-'}</p>
                <p className="text-xs text-slate-500 mt-1">Real vs Esperado</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Índice Sanitário</p>
                <p className="text-xl font-black text-slate-800">{healthIndex}%</p>
                <p className="text-xs text-slate-500 mt-1">Status Global</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              {/* Consumo Chart */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-200 pb-1">Curva de Consumo</h3>
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 20, right: 0, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRealRep" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      {phaseMilestones.map((pm, i) => (
                        <ReferenceLine key={i} x={pm.idade} stroke="#cbd5e1" strokeDasharray="3 3">
                           <Label value={pm.label} position="insideTopRight" offset={10} fill="#94a3b8" fontSize={9} />
                        </ReferenceLine>
                      ))}
                      <XAxis dataKey="idade" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} minTickGap={20} />
                      <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                      <Area type="monotone" dataKey="real" stroke="none" fill="url(#colorRealRep)" fillOpacity={1} connectNulls={true} isAnimationActive={false} />
                      <Line type="monotone" dataKey="esperado" stroke="#94a3b8" strokeWidth={1.5} dot={false} strokeDasharray="4 4" isAnimationActive={false} />
                      <Line type="monotone" dataKey="real" stroke="#3b82f6" strokeWidth={2} dot={false} connectNulls={true} isAnimationActive={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Radar Chart */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-200 pb-1">Diagnóstico Sanitário Final</h3>
                <div className="h-[220px] w-full relative">
                  {latestEvalVisit ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 9 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 3]} tick={false} axisLine={false} />
                        <Radar dataKey="score" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.4} isAnimationActive={false} />
                      </RadarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-xs text-slate-400">Sem avaliação</div>
                  )}
                </div>
              </div>
            </div>

            {/* Tratamentos */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-200 pb-1">Histórico de Tratamentos (Sumário)</h3>
              <div className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2 text-left">Data/Idade</th>
                      <th className="px-3 py-2 text-left">Produto</th>
                      <th className="px-3 py-2 text-left">Motivo</th>
                      <th className="px-3 py-2 text-right">Duração</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loteVisits.filter(v => v.tratamentos && v.tratamentos.length > 0).slice(-4).map(v => 
                      v.tratamentos!.map((t, idx) => (
                        <tr key={`${v.id}-${idx}`}>
                          <td className="px-3 py-2 whitespace-nowrap">{new Date(v.date + 'T12:00:00').toLocaleDateString('pt-BR')} ({v.idade}d)</td>
                          <td className="px-3 py-2 font-medium">{t.produtoNome}</td>
                          <td className="px-3 py-2">{t.motivo}</td>
                          <td className="px-3 py-2 text-right">{t.duracaoDias ? `${t.duracaoDias} dias` : '-'}</td>
                        </tr>
                      ))
                    )}
                    {loteVisits.filter(v => v.tratamentos && v.tratamentos.length > 0).length === 0 && (
                      <tr><td colSpan={4} className="px-3 py-4 text-center text-slate-400 italic">Nenhum tratamento registrado.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Ocorrências */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-200 pb-1">Ocorrências e Recomendações Recentes</h3>
              <div className="space-y-3">
                {loteVisits.filter(v => v.recomendacao).slice(-4).reverse().map(v => (
                  <div key={v.id} className="text-xs border-l-2 border-slate-300 pl-3 py-1">
                    <span className="font-bold text-slate-600 block mb-0.5">
                      {new Date(v.date + 'T12:00:00').toLocaleDateString('pt-BR')} (Idade: {v.idade} dias)
                    </span>
                    <p className="text-slate-700">{v.recomendacao}</p>
                  </div>
                ))}
                {loteVisits.filter(v => v.recomendacao).length === 0 && (
                  <p className="text-xs text-slate-400 italic">Nenhuma recomendação registrada.</p>
                )}
              </div>
            </div>

            <div className="mt-12 text-center text-[10px] text-slate-400 uppercase tracking-widest border-t border-slate-100 pt-4">
              Gerado por DashPro em {new Date().toLocaleDateString('pt-BR')} - Confidencial
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
