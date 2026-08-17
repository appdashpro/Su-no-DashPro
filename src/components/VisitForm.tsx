import { safeStorage } from "../lib/safeStorage";
import React, { useState } from 'react';
import { Visit, Integrado, isVisitForIntegrado } from '../types';
import { growthCurve, growthCurveFemea, getExpectedConsumption, getExpectedWeight, defaultMetas, defaultMetasFemea, getActiveCurve } from '../data';
import { Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';
import { TratamentosFormSection } from './TratamentosFormSection';

interface VisitaFormProps {
 integrados: Integrado[];
 visits?: Visit[];
 initialData?: Visit;
 isNewLote?: boolean;
 onSave: (visit: Visit, integradoNome?: string, alojamentoDate?: string) => void;
 onCancel?: () => void;
}

export function VisitaForm({ integrados, visits = [], initialData, isNewLote, onSave, onCancel }: VisitaFormProps) {
 const [formData, setFormData] = useState<Partial<Visit> & { alojamentoDate?: string, integradoNome?: string }>(() => {
 if (initialData) {
 const integrado = integrados.find(i => i.id === initialData.integradoId);
 const { metas } = getActiveCurve(integrado?.alojamentoDate, integrado?.status, initialData.tipoLote || 'Misto', integrado?.fechamentoDate);
 return {
 ...initialData,
 tipoLote: initialData.tipoLote || 'Misto',
 metaAlojamento: initialData.metaAlojamento ?? metas.metaAlojamento,
 metaCrescimento1: initialData.metaCrescimento1 ?? metas.metaCrescimento1,
 metaCrescimento2: initialData.metaCrescimento2 ?? metas.metaCrescimento2,
 metaCrescimento3: initialData.metaCrescimento3 ?? metas.metaCrescimento3,
 metaTerminacao1: initialData.metaTerminacao1 ?? metas.metaTerminacao1,
 metaTerminacao2: initialData.metaTerminacao2 ?? metas.metaTerminacao2,
 metaAcumulada: initialData.metaAcumulada ?? metas.metaAcumulada,
 alojamentoDate: integrado?.alojamentoDate,
 integradoNome: integrado?.name
 };
 }
 return {
 ...defaultMetas,
 date: new Date().toISOString().split('T')[0],
 comedouro: 'Linear',
 tipoLote: 'Misto',
 colaborador: 'Wagner'
 };
 });

 const [saving, setSaving] = useState(false);

 const [outrosColab, setOutrosColab] = useState(() => {
 if (!initialData || !initialData.colaborador) return '';
 const current = initialData.colaborador.split(/\s*[,/;-]\s*/).filter(Boolean);
 const predefined = ['Wagner', 'Helio', 'Alessandro', 'Roger', 'João', 'Luana', 'Adelio'];
 return current.filter(c => !predefined.includes(c)).join(' / ');
 });

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (saving) return;
 setSaving(true);
 const { alojamentoDate, integradoNome, ...visitData } = formData;
 let targetIntegradoId = initialData?.integradoId;
 if (!targetIntegradoId) {
   const matchExact = integrados.find(i => 
     (i.name || '').trim().toLowerCase() === (integradoNome || '').trim().toLowerCase() && 
     (!alojamentoDate || i.alojamentoDate === alojamentoDate)
   );
   if (matchExact) {
     targetIntegradoId = matchExact.id;
   } else {
     const matchName = integrados.find(i => 
       (i.name || '').trim().toLowerCase() === (integradoNome || '').trim().toLowerCase() && 
       i.status === 'Em andamento'
     );
     if (matchName) {
       targetIntegradoId = matchName.id;
     } else {
       targetIntegradoId = crypto.randomUUID();
     }
   }
 }
 const integradoId = targetIntegradoId;
 if (!initialData) safeStorage.removeItem('VISIT_FORM_DRAFT');

 onSave({
 ...visitData,
 id: initialData ? initialData.id : crypto.randomUUID(),
 integradoId,
 idade: Number(visitData.idade) || 0,
 consumoAcumuladoReal: visitData.consumoAcumuladoReal !== undefined && visitData.consumoAcumuladoReal !== null && String(visitData.consumoAcumuladoReal).trim() !== '' ? Number(visitData.consumoAcumuladoReal) : undefined,
 mortalidade: visitData.mortalidade !== undefined && visitData.mortalidade !== null && String(visitData.mortalidade).trim() !== '' ? Number(visitData.mortalidade) : undefined,
 animaisAlojados: visitData.animaisAlojados !== undefined && visitData.animaisAlojados !== null && String(visitData.animaisAlojados).trim() !== '' ? Number(visitData.animaisAlojados) : undefined,
 animaisMortos: visitData.animaisMortos !== undefined && visitData.animaisMortos !== null && String(visitData.animaisMortos).trim() !== '' ? Number(visitData.animaisMortos) : undefined,
 descartesPeriodo: visitData.descartesPeriodo !== undefined && visitData.descartesPeriodo !== null && String(visitData.descartesPeriodo).trim() !== '' ? Number(visitData.descartesPeriodo) : undefined,
 sobraSiloKg: visitData.sobraSiloKg !== undefined && visitData.sobraSiloKg !== null && String(visitData.sobraSiloKg).trim() !== '' ? Number(visitData.sobraSiloKg) : undefined,
 pesoAmostradoKg: visitData.pesoAmostradoKg !== undefined && visitData.pesoAmostradoKg !== null && String(visitData.pesoAmostradoKg).trim() !== '' ? Number(visitData.pesoAmostradoKg) : undefined,
 volumeTotalCargas: visitData.volumeTotalCargas !== undefined && visitData.volumeTotalCargas !== null && String(visitData.volumeTotalCargas).trim() !== '' ? Number(visitData.volumeTotalCargas) : undefined,
 pesoAloj: visitData.pesoAloj !== undefined && visitData.pesoAloj !== null && String(visitData.pesoAloj).trim() !== '' ? Number(visitData.pesoAloj) : undefined,
 pontuacaoSanitaria: visitData.pontuacaoSanitaria !== undefined && visitData.pontuacaoSanitaria !== null && String(visitData.pontuacaoSanitaria).trim() !== '' ? Number(visitData.pontuacaoSanitaria) : undefined,
 } as Visit, integradoNome, alojamentoDate);
 };

 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
 const { name, value } = e.target;
 
 let updates: any = { [name]: value };
 
 if (name === 'tipoLote' || name === 'alojamentoDate') {
 const activeTipo = name === 'tipoLote' ? value : formData.tipoLote;
 const activeAlojDate = name === 'alojamentoDate' ? value : formData.alojamentoDate;
 const { metas } = getActiveCurve(activeAlojDate, undefined, activeTipo);
 updates = {
 ...updates,
 ...metas
 };
 }

 if (name === 'integradoNome' || name === 'alojamentoDate') {
 const nomeToSearch = name === 'integradoNome' ? value : formData.integradoNome;
 const dateToSearch = name === 'alojamentoDate' ? value : undefined;
 
 if (nomeToSearch) {
 const matchingIntegradosAll = integrados.filter(i => (i.name || '').toLowerCase() === String(nomeToSearch || '').toLowerCase());
 const emAndamento = matchingIntegradosAll.filter(i => i.status === 'Em andamento');
 
 let integrado = undefined;
 
 if (emAndamento.length > 0) {
 if (dateToSearch) {
 integrado = emAndamento.find(i => i.alojamentoDate === dateToSearch);
 }
 
 if (!integrado) {
 emAndamento.sort((a, b) => new Date(b.alojamentoDate).getTime() - new Date(a.alojamentoDate).getTime());
 integrado = emAndamento[0];
 }
 }

 if (integrado) {
 if (!isNewLote) {
 if (name === 'integradoNome') {
 updates.alojamentoDate = integrado.alojamentoDate;
 }
 
 // Find previous visits for this integrado to auto-fill animaisAlojados and animaisMortos
 const integradoVisits = visits.filter(v => v.integradoId === integrado.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
 if (integradoVisits.length > 0) {
 const lastVisit = integradoVisits[0];
 if (lastVisit.animaisAlojados) updates.animaisAlojados = lastVisit.animaisAlojados;
 if (lastVisit.animaisMortos) updates.animaisMortos = lastVisit.animaisMortos;
 if (lastVisit.mortalidade) updates.mortalidade = lastVisit.mortalidade;
 ['pesoAloj', 'pontuacaoSanitaria', 'cargaAlojamento', 'consumoAlojamento', 'cargaCrescimento1', 'consumoCrescimento1', 'cargaCrescimento2', 'consumoCrescimento2', 'cargaCrescimento3', 'consumoCrescimento3', 'cargaTerminacao1', 'consumoTerminacao1', 'cargaTerminacao2', 'consumoTerminacao2', 'volumeTotalCargas', 'consumoAcumuladoReal'].forEach(key => {
 if (lastVisit[key as keyof typeof lastVisit] !== undefined && lastVisit[key as keyof typeof lastVisit] !== null) updates[key] = lastVisit[key as keyof typeof lastVisit];
 });
 } else {
 // If we changed to a different lote that has NO visits yet, we should probably clear the auto-filled fields
 ['animaisAlojados', 'animaisMortos', 'mortalidade', 'pesoAloj', 'pontuacaoSanitaria', 'cargaAlojamento', 'consumoAlojamento', 'cargaCrescimento1', 'consumoCrescimento1', 'cargaCrescimento2', 'consumoCrescimento2', 'cargaCrescimento3', 'consumoCrescimento3', 'cargaTerminacao1', 'consumoTerminacao1', 'cargaTerminacao2', 'consumoTerminacao2', 'volumeTotalCargas', 'consumoAcumuladoReal'].forEach(key => {
 updates[key] = '';
 });
 }
 }
 }
 }
 }


 
 setFormData(prev => {
 const newData = { ...prev, ...updates };
 
 // Auto-calculate consumoAcumuladoReal based on volumeTotalCargas
 
 // Auto-calculate consumos when cargas change or mortos change
 const alojados = Number(newData.animaisAlojados) || 0;
 const mortos = Number(newData.animaisMortos) || 0;
    const descartes = Number(newData.descartesPeriodo) || 0;
    const vivos = alojados - mortos - descartes;
 
 if (alojados > 0) {
 newData.mortalidade = Number(((mortos / alojados) * 100).toFixed(2));
 } else {
 newData.mortalidade = undefined;
 }
 
 if (vivos > 0) {
 if (newData.cargaAlojamento) newData.consumoAlojamento = Number((Number(newData.cargaAlojamento) / vivos).toFixed(2));
 if (newData.cargaCrescimento1) newData.consumoCrescimento1 = Number((Number(newData.cargaCrescimento1) / vivos).toFixed(2));
 if (newData.cargaCrescimento2) newData.consumoCrescimento2 = Number((Number(newData.cargaCrescimento2) / vivos).toFixed(2));
 if (newData.cargaCrescimento3) newData.consumoCrescimento3 = Number((Number(newData.cargaCrescimento3) / vivos).toFixed(2));
 if (newData.cargaTerminacao1) newData.consumoTerminacao1 = Number((Number(newData.cargaTerminacao1) / vivos).toFixed(2));
 if (newData.cargaTerminacao2) newData.consumoTerminacao2 = Number((Number(newData.cargaTerminacao2) / vivos).toFixed(2));
 
 // volumeTotalCargas is always the sum of all specific cargas
 const sumCargas = (Number(newData.cargaAlojamento) || 0) + (Number(newData.cargaCrescimento1) || 0) + (Number(newData.cargaCrescimento2) || 0) + (Number(newData.cargaCrescimento3) || 0) + (Number(newData.cargaTerminacao1) || 0) + (Number(newData.cargaTerminacao2) || 0);
 
 
  if (name.startsWith('carga')) {
    newData.volumeTotalCargas = sumCargas > 0 ? sumCargas : undefined;
 }

 const currentVolumeTotal = Number(newData.volumeTotalCargas) || sumCargas;
 const sobraSilo = Number(newData.sobraSiloKg) || 0;
 const volumeSubtracted = currentVolumeTotal - sobraSilo;
 
 if (name.startsWith('carga') || name === 'volumeTotalCargas' || name === 'animaisAlojados' || name === 'animaisMortos' || name === 'descartesPeriodo' || name === 'sobraSiloKg') {
    if (volumeSubtracted > 0 && vivos > 0) {
        newData.consumoAcumuladoReal = Number((volumeSubtracted / vivos).toFixed(2));
    } else if (name.startsWith('carga')) {
        newData.consumoAcumuladoReal = undefined;
    }
 }
 }

 if ((name === 'date' || name === 'alojamentoDate' || name === 'integradoNome') && newData.date && newData.alojamentoDate) {
 const [vY, vM, vD] = newData.date.split('-');
 const [aY, aM, aD] = newData.alojamentoDate.split('-');
 const visitDate = new Date(Number(vY), Number(vM) - 1, Number(vD));
 const alojamentoDate = new Date(Number(aY), Number(aM) - 1, Number(aD));
 
 const diffTime = visitDate.getTime() - alojamentoDate.getTime();
 const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
 newData.idade = diffDays >= 0 ? diffDays : 0;
 }
 return newData;
 });
 };

 const matchingIntegrado = integrados.find(i => 
   (initialData && i.id === initialData.integradoId) ||
   ((i.name || '').trim().toLowerCase() === (formData.integradoNome || '').trim().toLowerCase() && (!formData.alojamentoDate || i.alojamentoDate === formData.alojamentoDate))
 );
 const currentIntegradoId = matchingIntegrado?.id || initialData?.integradoId || `i_${(formData.integradoNome || '').replace(/\s+/g, '').toLowerCase()}_${(formData.alojamentoDate || '').replace(/[-/]/g, '')}`;
 const integrado = matchingIntegrado || integrados.find(i => i.id === currentIntegradoId);
 const currentIdade = Number(formData.idade) || 0;
 const expectedConsumption = currentIdade > 0 ? getExpectedConsumption(currentIdade, formData.tipoLote as any, formData.pesoAloj, integrado?.alojamentoDate, integrado?.status, integrado?.fechamentoDate) : null;
 const expectedWeight = currentIdade > 0 ? getExpectedWeight(currentIdade, formData.tipoLote as any, formData.pesoAloj) : null;


 const dynamicChartData = React.useMemo(() => {
 if (currentIdade <= 0) return [];
 const data = [];
 const maxDays = Math.min(150, currentIdade + 10);
 for (let d = 1; d <= maxDays; d++) {
 data.push({
 dia: d,
 consumoAcumulado: getExpectedConsumption(d, formData.tipoLote as any, formData.pesoAloj, integrado?.alojamentoDate, integrado?.status, integrado?.fechamentoDate)
 });
 }
 return data;
 }, [currentIdade, formData.tipoLote, formData.pesoAloj]);

 const currentConsumoReal = Number(formData.consumoAcumuladoReal) || null;
 const currentDiffKg = (currentConsumoReal !== null && expectedConsumption !== null) ? (currentConsumoReal - expectedConsumption) : null;
 const currentDiffPct = (currentDiffKg !== null && expectedConsumption && expectedConsumption > 0) ? (currentDiffKg / expectedConsumption * 100) : null;

 const prevVisit = [...visits]
 .filter(v => (integrado ? isVisitForIntegrado(v, integrado) : v.integradoId === currentIntegradoId) && (!initialData || v.id !== initialData.id) && new Date(v.date).getTime() < new Date(formData.date || new Date().toISOString()).getTime())
 .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

 let prevVisitInfo = null;
 if (!initialData && prevVisit) {
 const prevIdade = prevVisit.idade || 0;
 const prevExpected = getExpectedConsumption(prevIdade, prevVisit.tipoLote || formData.tipoLote as any, prevVisit.pesoAloj || formData.pesoAloj, integrado?.alojamentoDate, integrado?.status, integrado?.fechamentoDate);
 const prevReal = prevVisit.consumoAcumuladoReal;
 
 let diffInfo = '';
 if (prevReal !== undefined && prevReal !== null && prevExpected) {
 const diffKg = prevReal - prevExpected;
 const diffPct = (diffKg / prevExpected * 100);
 const status = diffKg > 0 ? 'acima' : diffKg < 0 ? 'abaixo' : 'dentro';
 diffInfo = `${Math.abs(diffKg).toFixed(2)} kg ${status} do esperado (${Math.abs(diffPct).toFixed(2)}%)`;
 } else {
 diffInfo = 'Sem dados de consumo na última visita.';
 }
 
 prevVisitInfo = {
 date: prevVisit.date,
 diffInfo
 };
 }

 return (
 <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden max-w-4xl mx-auto">
 <div className="px-6 py-5 border-b border-slate-200">
 <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
 {initialData ? 'Editar Lançamento' : 'Novo Lançamento Rápido'}
 </h2>
 </div>


 <form onSubmit={handleSubmit} className="p-6 space-y-6">
 {prevVisitInfo && (
 <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
 <h3 className="text-sm font-semibold text-blue-800">Última Visita: {prevVisitInfo.date.split('-').reverse().join('/')}</h3>
 <p className="text-sm text-blue-700 mt-1">{prevVisitInfo.diffInfo}</p>
 </div>
 )}

 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
 <div className="space-y-2">
 <label className="block text-xs font-semibold text-slate-500 mb-1">Data da Visita</label>
 <input 
 type="date" 
 name="date"
 required
 value={formData.date || ''}
 onChange={handleChange}
 className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
 />
 </div>

 <div className="space-y-2 md:col-span-2">
 <label className="block text-xs font-semibold text-slate-500 mb-1">Integrado (Nome)</label>
 <input 
 type="text"
 id="form-integrado-nome" 
 name="integradoNome"
 list="integrados-list"
 required
 value={formData.integradoNome || ''}
 onChange={handleChange}
 className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
 />
 <datalist id="integrados-list">
 {Array.from(new Set(integrados.filter(i => isNewLote ? true : i.status === 'Em andamento').map(i => i.name))).map(name => (
 <option key={name} value={name} />
 ))}
 </datalist>
 </div>

 <div className="space-y-2">
 <label className="block text-xs font-semibold text-slate-500 mb-1">Data de Alojamento</label>
 {(!initialData && !isNewLote && formData.integradoNome && integrados.filter(i => (i.name || '').toLowerCase() === String(formData.integradoNome || '').toLowerCase() && i.status === 'Em andamento').length > 1) ? (
 <select
 name="alojamentoDate"
 required
 value={formData.alojamentoDate || ''}
 onChange={handleChange}
 className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
 >
 {integrados
 .filter(i => (i.name || '').toLowerCase() === String(formData.integradoNome || '').toLowerCase() && i.status === 'Em andamento')
 .sort((a, b) => new Date(b.alojamentoDate).getTime() - new Date(a.alojamentoDate).getTime())
 .map(i => (
 <option key={i.id} value={i.alojamentoDate}>
 {i.alojamentoDate.split('-').reverse().join('/')}
 </option>
 ))
 }
 </select>
 ) : (
 <input 
 type="date" 
 name="alojamentoDate"
 required
 value={formData.alojamentoDate || ''}
 onChange={handleChange}
 className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
 />
 )}
 </div>
 </div>

 {formData.integradoNome && (
 <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex flex-col md:flex-row md:justify-between items-center text-sm -mt-2">
 <div className="flex flex-col gap-1 text-slate-600">
 <span className="font-medium text-slate-800 mb-1">Resumo Automático do Lote</span>
 <span className="flex items-center gap-2">Idade calculada: <strong className="text-blue-900">{currentIdade} dias</strong></span>
 <span className="flex items-center gap-2">Animais Vivos: <strong className="text-blue-900">{(Number(formData.animaisAlojados) || 0) - (Number(formData.animaisMortos) || 0) - (Number(formData.descartesPeriodo) || 0)}</strong> <span className="text-xs text-slate-500">({formData.animaisAlojados || 0} alojados)</span></span>
 </div>
 <div className="flex flex-col gap-1 text-slate-600 md:text-right mt-3 md:mt-0">
 <span className="flex items-center gap-2 justify-end">Peso Esperado: <strong className="text-blue-900">{expectedWeight ? expectedWeight.toFixed(2) : '-'} kg</strong></span>
 <span className="flex items-center gap-2 justify-end">Consumo Esperado: <strong className="text-blue-900">{expectedConsumption || '-'} kg/cab</strong></span>
 
 <span className="flex items-center gap-2 justify-end">Consumo Real (Calculado): <strong className={currentDiffKg !== null && Math.abs(currentDiffKg) <= 5 ? 'text-blue-600' : currentDiffKg !== null && currentDiffKg > 5 ? 'text-red-600' : currentDiffKg !== null && currentDiffKg < -5 ? 'text-emerald-600' : 'text-slate-600'}>{formData.consumoAcumuladoReal || '-'} kg/cab</strong></span>
 {currentDiffKg !== null && currentDiffPct !== null && (
 <span className={`flex items-center gap-2 justify-end text-xs font-semibold ${Math.abs(currentDiffKg) <= 5 ? 'text-blue-600' : currentDiffKg > 5 ? 'text-red-600' : 'text-emerald-600'}`}>
 Diferença: {currentDiffKg > 0 ? '+' : ''}{currentDiffKg.toFixed(2)} kg ({currentDiffKg > 0 ? '+' : ''}{currentDiffPct.toFixed(2)}%)
 </span>
 )}

 </div>
 </div>
 )}

 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
 <div className="space-y-2">
 <label className="block text-xs font-semibold text-slate-500 mb-1">Idade (Dias)</label>
 <input 
 type="number" 
 name="idade"
 min="1"
 max="150"
 required
 value={formData.idade || ''}
 onChange={handleChange}
 className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
 />
 </div>

 

 <div className="space-y-2">
 <label className="block text-xs font-semibold text-slate-500 mb-1">Animais Alojados</label>
 <input 
 type="number" 
 name="animaisAlojados"
 value={formData.animaisAlojados || ''}
 onChange={handleChange}
 placeholder="Ex: 1000"
 className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
 />
 </div>

 <div className="space-y-2">
 <label className="block text-xs font-semibold text-slate-500 mb-1 flex justify-between items-center">
 <span>Animais Mortos</span>
 {formData.mortalidade !== undefined && formData.mortalidade !== null && !isNaN(Number(formData.mortalidade)) && (
 <span className="flex items-center gap-2"><span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[10px]">{(Number(formData.animaisAlojados) || 0) - (Number(formData.animaisMortos) || 0) - (Number(formData.descartesPeriodo) || 0)} vivos</span><span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded text-[10px]">{Number(formData.mortalidade || 0).toFixed(2)}%</span></span>
 )}
 </label>
 <input 
 type="number" 
 name="animaisMortos"
 value={formData.animaisMortos ?? ''}
 onChange={handleChange}
 placeholder="Ex: 5"
 className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
 />
 </div>
 <div className="space-y-2">
 <label className="block text-xs font-semibold text-slate-500 mb-1">Descartes / Refugos</label>
 <input
  type="number"
  name="descartesPeriodo"
  value={formData.descartesPeriodo ?? ''}
  onChange={handleChange}
  placeholder="Ex: 2"
  className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
 />
 </div>

 <div className="space-y-2">
 <label className="block text-xs font-semibold text-slate-500 mb-1">Comedouro</label>
 <select 
 name="comedouro"
 value={formData.comedouro || ''}
 onChange={handleChange}
 className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
 >
 <option value="Linear">Linear</option>
 <option value="Automático">Automático</option>
 <option value="Misto">Misto</option>
 <option value="Macho">Macho</option>
 </select>
 </div>
 
 <div className="space-y-2">
 <label className="block text-xs font-semibold text-slate-500 mb-1">Tipo de Lote</label>
 <select 
 name="tipoLote"
 value={formData.tipoLote || 'Misto'}
 onChange={handleChange}
 className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
 >
 <option value="Misto">Misto</option>
 <option value="Fêmea">Fêmea</option>
 <option value="Macho">Macho</option>
 </select>
 </div>
 
 <div className="space-y-2">
 <label className="block text-xs font-semibold text-slate-500 mb-1">Peso Aloj (kg)</label>
 <input 
 type="number" 
 step="0.01"
 name="pesoAloj"
 value={formData.pesoAloj || ''}
 onChange={handleChange}
 className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
 />
 </div>

 <div className="space-y-2">
 <label className="block text-xs font-semibold text-slate-500 mb-1">Pontuação Sanitária</label>
 <input 
 type="number" 
 name="pontuacaoSanitaria"
 value={formData.pontuacaoSanitaria || ''}
 onChange={handleChange}
 className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
 />
 </div>
 <div className="space-y-2">
 <label className="block text-xs font-semibold text-slate-500 mb-1">Peso Amostrado (kg)</label>
 <input
  type="number"
  step="0.01"
  name="pesoAmostradoKg"
  value={formData.pesoAmostradoKg ?? ''}
  onChange={handleChange}
  placeholder="Ex: 85.5"
  className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
 />
 </div>
 <div className="space-y-2">
 <label className="block text-xs font-semibold text-slate-500 mb-1">Sobra no Silo (kg)</label>
 <input
  type="number"
  name="sobraSiloKg"
  value={formData.sobraSiloKg ?? ''}
  onChange={handleChange}
  placeholder="Ao encerrar"
  className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
 />
 </div>
 </div>

 <TratamentosFormSection 
 tratamentos={formData.tratamentos || []}
 onChange={(tratamentos) => setFormData(prev => ({ ...prev, tratamentos }))}
 idade={Number(formData.idade) || 0}
 animaisVivos={(Number(formData.animaisAlojados) || 0) - (Number(formData.animaisMortos) || 0) - (Number(formData.descartesPeriodo) || 0)}
 tipoLote={formData.tipoLote as any || 'Misto'}
 alojamentoDate={formData.alojamentoDate}
 />

 <div className="space-y-4 pt-4 border-t border-slate-100">
 <div className="space-y-2">
 <label className="block text-xs font-semibold text-slate-500 mb-1">Recomendações e Observações do Lote</label>
 <textarea 
 name="recomendacao"
 required
 rows={3}
 value={formData.recomendacao || ''}
 onChange={handleChange}
 placeholder="Ex: Lote com consumo abaixo da tabela..."
 className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
 />
 </div>

 <h3 className="text-sm font-bold text-slate-700">Lançamento de Cargas e Consumo (kg)</h3>
 <div className="overflow-x-auto w-full -ml-2 -mr-2 md:mx-0 pr-4 md:pr-0">
 <table className="w-full text-sm text-left border-collapse min-w-[500px]">
 <thead>
 <tr className="border-b border-slate-200">
 <th className="py-2 pr-2 md:pr-4 pl-2 font-semibold text-slate-500 uppercase text-[10px]">Fase</th>
 <th className="py-2 pr-2 md:pr-4 font-semibold text-slate-500 uppercase text-[10px] w-1/4">Carga Total (kg)</th>
 <th className="py-2 pr-2 md:pr-4 font-semibold text-slate-500 uppercase text-[10px] w-1/4">Cons. Real (kg/cab)</th>
 <th className="py-2 pr-2 md:pr-4 font-semibold text-slate-500 uppercase text-[10px] w-1/4">Meta Ref. (kg)</th>
 <th className="py-2 pr-2 md:pr-4 font-semibold text-slate-500 uppercase text-[10px]">Desvio</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {[
 { id: 'Alojamento', label: 'Alojamento', metaKey: 'metaAlojamento', cargaKey: 'cargaAlojamento', consKey: 'consumoAlojamento' },
 { id: 'Crescimento1', label: 'Crescimento 1', metaKey: 'metaCrescimento1', cargaKey: 'cargaCrescimento1', consKey: 'consumoCrescimento1' },
 { id: 'Crescimento2', label: 'Crescimento 2', metaKey: 'metaCrescimento2', cargaKey: 'cargaCrescimento2', consKey: 'consumoCrescimento2' },
 { id: 'Crescimento3', label: 'Crescimento 3', metaKey: 'metaCrescimento3', cargaKey: 'cargaCrescimento3', consKey: 'consumoCrescimento3' },
 { id: 'Terminacao1', label: 'Terminação 1', metaKey: 'metaTerminacao1', cargaKey: 'cargaTerminacao1', consKey: 'consumoTerminacao1' },
 { id: 'Terminacao2', label: 'Terminação 2', metaKey: 'metaTerminacao2', cargaKey: 'cargaTerminacao2', consKey: 'consumoTerminacao2' },
 ].map((phase) => {
 const cons = Number((formData as any)[phase.consKey]);
 const meta = Number((formData as any)[phase.metaKey]);
 const diff = (cons && meta) ? (cons - meta) : null;
 const diffPct = (diff !== null && meta) ? (diff / meta * 100) : null;
 
 return (
 <tr key={phase.id} className="hover:bg-slate-50">
 <td className="py-2 pr-2 md:pr-4 pl-2 font-medium text-slate-700 text-xs md:text-sm">{phase.label}</td>
 <td className="py-2 pr-2 md:pr-4">
 <input type="number" step="0.01" name={phase.cargaKey} value={(formData as any)[phase.cargaKey] || ''} onChange={handleChange} className="w-full border border-slate-200 rounded p-1.5 text-xs md:text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0.00" />
 </td>
 <td className="py-2 pr-2 md:pr-4">
 <input type="number" step="0.01" name={phase.consKey} value={(formData as any)[phase.consKey] || ''} onChange={handleChange} className={`w-full border border-slate-200 rounded p-1.5 text-xs md:text-sm bg-slate-50 font-semibold focus:ring-2 focus:ring-blue-500 outline-none ${diff !== null && Math.abs(diff) <= 1 ? 'text-blue-600' : diff !== null && diff > 1 ? 'text-red-600' : diff !== null && diff < -1 ? 'text-emerald-600' : 'text-slate-600'}`} readOnly placeholder="0.00" />
 </td>
 <td className="py-2 pr-2 md:pr-4 text-slate-500 text-xs md:text-sm">
 {(formData as any)[phase.metaKey] || '-'}
 </td>
 <td className="py-2 pr-2 md:pr-4 text-xs md:text-sm font-medium">
 {diff !== null && diffPct !== null ? (
 <span className={Math.abs(diff) <= 1 ? 'text-blue-600' : diff > 1 ? 'text-red-600' : 'text-emerald-600'}>
 {diff > 0 ? '+' : ''}{diff.toFixed(2)} kg ({diff > 0 ? '+' : ''}{diffPct.toFixed(2)}%)
 </span>
 ) : '-'}
 </td>
 </tr>
 )})}
 </tbody>
 <tfoot className="border-t-2 border-slate-200 font-semibold bg-slate-50">
 <tr>
 <td className="py-3 pr-2 md:pr-4 pl-2 text-slate-700 text-xs md:text-sm">TOTAL ACUMULADO<br/><span className="text-[10px] font-normal text-slate-500">(Editável se faltar fase)</span></td>
 <td className="py-3 pr-2 md:pr-4">
 <input type="number" step="0.01" name="volumeTotalCargas" value={formData.volumeTotalCargas ?? ''} onChange={handleChange} className="w-full border border-slate-300 rounded p-1.5 text-xs md:text-sm font-bold bg-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0.00" />
 </td>
 <td className="py-3 pr-2 md:pr-4">
 <input type="number" step="0.01" name="consumoAcumuladoReal" value={formData.consumoAcumuladoReal ?? ''} onChange={handleChange} className={`w-full border border-slate-300 rounded p-1.5 text-xs md:text-sm font-bold bg-white focus:ring-2 focus:ring-blue-500 outline-none ${currentDiffKg !== null && Math.abs(currentDiffKg) <= 5 ? 'text-blue-600' : currentDiffKg !== null && currentDiffKg > 5 ? 'text-red-600' : currentDiffKg !== null && currentDiffKg < -5 ? 'text-emerald-600' : 'text-slate-700'}`} placeholder="0.00" />
 </td>
 <td className="py-3 pr-2 md:pr-4 text-slate-500 text-xs md:text-sm">
 {formData.metaAcumulada || '-'}
 </td>
 <td className="py-3 pr-2 md:pr-4 text-xs md:text-sm font-bold">
 {currentDiffKg !== null && currentDiffPct !== null ? (
 <span className={Math.abs(currentDiffKg) <= 1 ? 'text-blue-600' : currentDiffKg > 1 ? 'text-red-600' : 'text-green-600'}>
 {currentDiffKg > 0 ? '+' : ''}{currentDiffKg.toFixed(2)} kg
 </span>
 ) : '-'}
 </td>
 </tr>
 </tfoot>
 </table>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
 <div className="space-y-2">
 <label className="block text-xs font-semibold text-slate-500 mb-2">Técnico/Colaborador</label>
 <div className="flex flex-wrap gap-2">
 {['Wagner', 'Helio', 'Alessandro', 'Roger', 'João', 'Luana', 'Adelio'].map(colab => {
 const current = formData.colaborador ? formData.colaborador.split(/\s*[,/;-]\s*/).filter(Boolean) : [];
 const isSelected = current.includes(colab);
 return (
 <button
 key={colab}
 type="button"
 onClick={() => {
 const predefined = ['Wagner', 'Helio', 'Alessandro', 'Roger', 'João', 'Luana', 'Adelio'];
 const currentSelected = formData.colaborador ? formData.colaborador.split(/\s*[,/;-]\s*/).filter(Boolean).filter(c => predefined.includes(c)) : [];
 let newSelected;
 if (!isSelected) {
 newSelected = [...currentSelected, colab];
 } else {
 newSelected = currentSelected.filter(c => c !== colab);
 }
 const typed = outrosColab.split(/\s*[,/;-]\s*/).filter(Boolean);
 setFormData(prev => ({ ...prev, colaborador: [...newSelected, ...typed].join(' / ') }));
 }}
 className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
 isSelected 
 ? 'bg-blue-50 text-blue-700 border-blue-200' 
 : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
 }`}
 >
 {colab}
 </button>
 )
 })}
 </div>
 <input 
 type="text"
 placeholder="Outros (separe por barra)"
 value={outrosColab}
 onChange={(e) => {
 const val = e.target.value;
 setOutrosColab(val);
 const predefined = ['Wagner', 'Helio', 'Alessandro', 'Roger', 'João', 'Luana', 'Adelio'];
 const currentSelected = formData.colaborador ? formData.colaborador.split(/\s*[,/;-]\s*/).filter(Boolean).filter(c => predefined.includes(c)) : [];
 const typed = val.split(/\s*[,/;-]\s*/).filter(Boolean);
 setFormData(prev => ({ ...prev, colaborador: [...currentSelected, ...typed].join(' / ') }));
 }}
 onBlur={() => {
 const typed = outrosColab.split(/\s*[,/;-]\s*/).filter(Boolean);
 setOutrosColab(typed.join(' / '));
 }}
 className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none mt-2"
 />
 </div>
 </div>

 {currentIdade > 0 && (
 <div className="mt-6 pt-6 border-t border-slate-100 min-w-0">
 <h3 className="text-sm font-bold text-slate-500 mb-4">Acompanhamento de Consumo (Interativo)</h3>
 <div className="h-64 bg-slate-50 border border-slate-200 rounded-lg p-2 md:p-4 min-w-0">
 <ResponsiveContainer width="100%" height="100%">
 <LineChart data={dynamicChartData} margin={{ top: 5, right: 20, bottom: 25, left: 0 }}>
 <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
 <XAxis dataKey="dia" type="number" domain={['dataMin', 'dataMax']} label={{ value: 'Idade (Dias)', position: 'insideBottom', offset: -10 }} stroke="#64748b" fontSize={12} />
 <YAxis label={{ value: 'Consumo (kg)', angle: -90, position: 'insideLeft' }} stroke="#64748b" fontSize={12} />
 <Tooltip cursor={{ stroke: '#cbd5e1' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
 <Line type="monotone" dataKey="consumoAcumulado" stroke="#3b82f6" strokeWidth={3} dot={{ r: 0 }} activeDot={{ r: 4 }} name="Esperado" />
 {formData.consumoAcumuladoReal !== undefined && String(formData.consumoAcumuladoReal) !== '' && (
 <ReferenceDot 
 x={currentIdade} 
 y={Number(formData.consumoAcumuladoReal)} 
 r={6} 
 fill={(currentDiffKg !== null && Math.abs(currentDiffKg) <= 5) ? "#3b82f6" : (currentDiffKg !== null && currentDiffKg < -5) ? "#10b981" : "#ef4444"} 
 stroke="white" 
 strokeWidth={2}
 
 />
 )}
 </LineChart>
 </ResponsiveContainer>
 <p className="text-xs text-center text-slate-500 mt-2">
 O ponto colorido mostra o consumo real atual vs a curva esperada.<br className="md:hidden" />
 <span className="inline-block w-3 h-3 rounded-full bg-blue-500 ml-2 mr-1 align-middle"></span> Na meta (±5kg)
 <span className="inline-block w-3 h-3 rounded-full bg-emerald-500 ml-2 mr-1 align-middle"></span> Abaixo (&lt;-5kg)
 <span className="inline-block w-3 h-3 rounded-full bg-red-500 ml-2 mr-1 align-middle"></span> Acima (&gt;5kg)
 </p>
 </div>
 </div>
 )}

 <div className="pt-4 border-t border-slate-100 flex gap-3">
 {onCancel && (
 <button
 type="button"
 onClick={onCancel}
 className="flex-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold py-2.5 rounded text-sm transition-colors"
 >
 Cancelar
 </button>
 )}
 <button
 type="submit" id="form-salvar"
 disabled={saving}
 className="flex-1 bg-slate-900 text-white hover:bg-slate-800 font-semibold py-2.5 rounded text-sm transition-colors flex items-center justify-center gap-2"
 >
 {saving ? 'Registrando...' : (initialData ? 'Atualizar Lançamento' : 'Registrar Coleta')}
 </button>
 </div>
 </form>
 </div>
 );
}
