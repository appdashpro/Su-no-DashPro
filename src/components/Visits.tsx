import React, { useState } from 'react';
import { Visit, Integrado } from '../types';
import { getExpectedConsumption } from '../data';
import { Search, ArrowUpDown, Download, Plus, Eye, X, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface VisitsListProps {
 visits: Visit[];
 integrados: Integrado[];
 onEditVisit: (id: string) => void;
 onDeleteVisit: (id: string) => void;
 onNewVisit?: () => void;
 onNewLote?: () => void;
 onExport?: (data?: Visit[]) => void;
 viewingIntegradoId?: string | null;
 onSetViewingIntegradoId?: (id: string | null) => void;
}

type SortOption = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc' | 'idade-desc' | 'idade-asc';

export function VisitsList({ visits, integrados, onEditVisit, onDeleteVisit, onNewVisit, onNewLote, onExport, viewingIntegradoId, onSetViewingIntegradoId }: VisitsListProps) {
 const [searchTerm, setSearchTerm] = useState('');
 const [sortBy, setSortBy] = useState<SortOption>('date-desc');
 const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
 const [internalSelected, setInternalSelected] = useState<string | null>(null);

 const selectedIntegradoDetails = viewingIntegradoId !== undefined ? viewingIntegradoId : internalSelected;
 const setSelectedIntegradoDetails = (id: string | null) => {
 if (onSetViewingIntegradoId) onSetViewingIntegradoId(id);
 setInternalSelected(id);
 };

 const getIntegradoName = (integradoId: string) => {
 return integrados.find(i => i.id === integradoId)?.name || '';
 };

 const sortedVisits = [...visits].sort((a, b) => {
 switch (sortBy) {
 case 'date-desc':
 return new Date(b.date).getTime() - new Date(a.date).getTime();
 case 'date-asc':
 return new Date(a.date).getTime() - new Date(b.date).getTime();
 case 'name-asc':
 return getIntegradoName(a.integradoId).localeCompare(getIntegradoName(b.integradoId));
 case 'name-desc':
 return getIntegradoName(b.integradoId).localeCompare(getIntegradoName(a.integradoId));
 case 'idade-desc':
 return b.idade - a.idade;
 case 'idade-asc':
 return a.idade - b.idade;
 default:
 return 0;
 }
 });

 const filteredVisits = sortedVisits.filter(v => {
 const integrado = integrados.find(i => i.id === v.integradoId);
 return (integrado?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
 v.recomendacao.toLowerCase().includes(searchTerm.toLowerCase());
 });

 return (
 <div className="space-y-4">
 <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
 <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2 py-1.5 rounded flex-1 sm:flex-none">
 <ArrowUpDown className="w-4 h-4" />
 <select 
 value={sortBy}
 onChange={(e) => setSortBy(e.target.value as SortOption)}
 className="bg-transparent outline-none cursor-pointer text-slate-700 w-full"
 >
 <option value="date-desc">Data (Mais recentes)</option>
 <option value="date-asc">Data (Mais antigas)</option>
 <option value="name-asc">Nome (A-Z)</option>
 <option value="name-desc">Nome (Z-A)</option>
 <option value="idade-desc">Idade (Maior)</option>
 <option value="idade-asc">Idade (Menor)</option>
 </select>
 </div>
 <div className="relative w-full sm:max-w-md flex-1">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
 <input 
 type="text" 
 placeholder="Buscar por cliente ou recomendação..." 
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white"
 />
 </div>
 <div className="flex gap-2 w-full sm:w-auto">
 {onExport && (
 <button 
 onClick={() => onExport && onExport(filteredVisits)} 
 className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 px-4 py-2 rounded text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm"
 >
 <Download className="w-4 h-4" />
 <span className="hidden lg:inline">Exportar</span>
 </button>
 )}
 {onNewLote && (
 <button onClick={onNewLote} className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-emerald-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-emerald-700 transition-colors">
 <Plus className="w-4 h-4" />
 <span>Novo Lote</span>
 </button>
 )}
 {onNewVisit && (
 <button id="btn-novo-lancamento" onClick={onNewVisit} className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-slate-900 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-slate-800 transition-colors">
 <Plus className="w-4 h-4" />
 <span>Novo Lançamento</span>
 </button>
 )}
 </div>
 </div>
 <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1">
 <div className="overflow-auto max-h-[calc(100vh-180px)]">
 <table className="w-full text-left text-xs text-slate-600 min-w-[3000px] relative">
 <thead className="bg-slate-50 text-slate-700 font-semibold text-xs sticky top-0 z-20 shadow-sm">
 <tr>
 <th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Data</th>
 <th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Integrado</th>
 <th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Alojamento</th>
 <th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Tipo Lote</th>
 <th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Idade</th>
 <th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Animais Alojados</th>
 <th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Animais Mortos</th>
 <th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Mortalidade (%)</th>
 <th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Vol. Cargas (kg)</th>
 <th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Recomendação</th>
 <th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Consumo acumulado</th>
 <th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Comedouro</th>
 <th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Colaborador</th>
 <th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Meta Aloj</th>
 <th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Cons. Aloj</th>
 <th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Carga Aloj</th>
 <th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Meta Cresc 1</th>
 <th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Cons. Cresc 1</th>
 <th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Carga Cresc 1</th>
 <th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Meta Cresc 2</th>
 <th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Cons. Cresc 2</th>
 <th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Carga Cresc 2</th>
 <th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Meta Cresc 3</th>
 <th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Cons. Cresc 3</th>
 <th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Carga Cresc 3</th>
 <th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Meta Term 1</th>
 <th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Cons. Term 1</th>
 <th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Carga Term 1</th>
 <th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Meta Term 2</th>
 <th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Cons. Term 2</th>
 <th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Carga Term 2</th>
 <th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Meta Acum.</th>
 <th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Peso aloj</th>
 <th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Pontuação Sanitária</th>
 <th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Tratamentos</th>
 <th className="px-2 py-2 border-b border-slate-200 w-[60px] sticky right-0 top-0 bg-slate-50 z-30 text-center">Ações</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 <AnimatePresence>
 {filteredVisits.length === 0 ? (
 <tr>
 <td colSpan={36} className="px-5 py-8 text-center text-slate-500">Nenhuma visita encontrada.</td>
 </tr>
 ) : filteredVisits.map((v) => {
 const integrado = integrados.find(i => i.id === v.integradoId);
 const expected = getExpectedConsumption(v.idade, v.tipoLote, v.pesoAloj, integrado?.alojamentoDate, integrado?.status, integrado?.fechamentoDate);

 return (
 <motion.tr 
 layout 
 initial={{ opacity: 0 }} 
 animate={{ opacity: 1 }} 
 exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }} 
 key={v.id} 
 className="hover:bg-slate-50 transition-colors"
 >
 <td className="px-2 py-2 whitespace-nowrap">{
 new Date(Number(v.date.split('-')[0]), Number(v.date.split('-')[1]) - 1, Number(v.date.split('-')[2])).toLocaleDateString('pt-BR')
 }</td>
 <td className="px-2 py-2 font-medium text-slate-800">{integrado?.name || 'Desconhecido'}</td>
 <td className="px-2 py-2 whitespace-nowrap text-slate-600">{integrado?.alojamentoDate ? new Date(Number(integrado.alojamentoDate.split('-')[0]), Number(integrado.alojamentoDate.split('-')[1]) - 1, Number(integrado.alojamentoDate.split('-')[2])).toLocaleDateString('pt-BR') : '-'}</td>
 <td className="px-2 py-2 whitespace-nowrap"><span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">{v.tipoLote || 'Misto'}</span></td>
 <td className="px-2 py-2 whitespace-nowrap">{v.idade}</td>
 <td className="px-2 py-2 whitespace-nowrap">{v.animaisAlojados ?? '-'}</td>
 <td className="px-2 py-2 whitespace-nowrap">{v.animaisMortos ?? '-'}</td>
 <td className="px-2 py-2 whitespace-nowrap">
 {v.mortalidade !== undefined && v.mortalidade !== null 
 ? <span className="text-xs font-medium text-red-600 bg-red-50 px-1.5 py-0.5 rounded">{v.mortalidade}%</span> 
 : v.animaisAlojados && v.animaisMortos ? <span className="text-xs font-medium text-red-600 bg-red-50 px-1.5 py-0.5 rounded">{((Number(v.animaisMortos)/Number(v.animaisAlojados))*100).toFixed(2)}%</span> : '-'}
 </td>
 <td className="px-2 py-2 whitespace-nowrap">{v.volumeTotalCargas ?? '-'}</td>
 <td className="px-2 py-2">
 <div className="text-xs leading-relaxed min-w-[300px] whitespace-pre-wrap" title={v.recomendacao}>
 {v.recomendacao ? (
 <div className="space-y-1">
 {v.recomendacao.split('\n').filter(l => l.trim()).map((line, i) => (
 <div key={i}>{line.replace(/^[-\*]\s*/, '').trim()}</div>
 ))}
 </div>
 ) : '-'}
 </div>
 </td>
 <td className="px-2 py-2 whitespace-nowrap font-semibold">{v.consumoAcumuladoReal ?? '-'}</td>
 <td className="px-2 py-2 whitespace-nowrap text-xs">{v.comedouro || '-'}</td>
 <td className="px-2 py-2 whitespace-nowrap text-xs">{v.colaborador ? v.colaborador.replace(/\s*,\s*/g, ' / ') : '-'}</td>
 
 {/* Metas e Consumos */}
 <td className="px-2 py-2 whitespace-nowrap text-xs">{v.metaAlojamento ?? '-'}</td>
 <td className="px-2 py-2 whitespace-nowrap text-xs">{v.consumoAlojamento ?? '-'}</td>
 <td className="px-2 py-2 whitespace-nowrap text-xs">{v.cargaAlojamento ?? '-'}</td>
 <td className="px-2 py-2 whitespace-nowrap text-xs">{v.metaCrescimento1 ?? '-'}</td>
 <td className="px-2 py-2 whitespace-nowrap text-xs">{v.consumoCrescimento1 ?? '-'}</td>
 <td className="px-2 py-2 whitespace-nowrap text-xs">{v.cargaCrescimento1 ?? '-'}</td>
 <td className="px-2 py-2 whitespace-nowrap text-xs">{v.metaCrescimento2 ?? '-'}</td>
 <td className="px-2 py-2 whitespace-nowrap text-xs">{v.consumoCrescimento2 ?? '-'}</td>
 <td className="px-2 py-2 whitespace-nowrap text-xs">{v.cargaCrescimento2 ?? '-'}</td>
 <td className="px-2 py-2 whitespace-nowrap text-xs">{v.metaCrescimento3 ?? '-'}</td>
 <td className="px-2 py-2 whitespace-nowrap text-xs">{v.consumoCrescimento3 ?? '-'}</td>
 <td className="px-2 py-2 whitespace-nowrap text-xs">{v.cargaCrescimento3 ?? '-'}</td>
 <td className="px-2 py-2 whitespace-nowrap text-xs">{v.metaTerminacao1 ?? '-'}</td>
 <td className="px-2 py-2 whitespace-nowrap text-xs">{v.consumoTerminacao1 ?? '-'}</td>
 <td className="px-2 py-2 whitespace-nowrap text-xs">{v.cargaTerminacao1 ?? '-'}</td>
 <td className="px-2 py-2 whitespace-nowrap text-xs">{v.metaTerminacao2 ?? '-'}</td>
 <td className="px-2 py-2 whitespace-nowrap text-xs">{v.consumoTerminacao2 ?? '-'}</td>
 <td className="px-2 py-2 whitespace-nowrap text-xs">{v.cargaTerminacao2 ?? '-'}</td>
 <td className="px-2 py-2 whitespace-nowrap text-xs font-semibold">{v.metaAcumulada ?? '-'}</td>
 
 <td className="px-2 py-2 whitespace-nowrap text-xs">{v.pesoAloj ?? '-'}</td>
 <td className="px-2 py-2 whitespace-nowrap text-xs">{v.pontuacaoSanitaria ?? '-'}</td>
 <td className="px-2 py-2 whitespace-nowrap text-xs">{v.tratamentos && v.tratamentos.length > 0 ? v.tratamentos.map(t => t.produto).join(', ') : '-'}</td>
 
 <td className="px-2 py-2 whitespace-nowrap sticky right-0 bg-white group-hover:bg-slate-50 transition-colors z-10 w-[60px]">
 <div className="flex flex-col gap-1 items-center">
 <button
 onClick={() => setSelectedIntegradoDetails(v.integradoId)}
 className="text-slate-600 hover:text-slate-900 text-xs font-semibold px-2 py-1 rounded hover:bg-slate-100 transition-colors w-full text-center"
 title="Ver Detalhes do Lote"
 >
 Detalhes
 </button>
 <button 
 onClick={() => {
 setDeleteConfirmId(null);
 onEditVisit(v.id);
 }}
 className="text-blue-600 hover:text-blue-800 text-xs font-semibold px-2 py-1 rounded hover:bg-blue-50 transition-colors w-full text-center"
 >
 Editar
 </button>
 <button 
 onClick={() => setDeleteConfirmId(v.id)}
 className="text-red-600 hover:text-red-800 text-xs font-semibold px-2 py-1 rounded hover:bg-red-50 transition-colors w-full text-center"
 >
 Apagar
 </button>
 </div>
 </td>
 </motion.tr>
 );
 })}
 </AnimatePresence>
 </tbody>
 </table>
 </div>
 </div>


 {/* Delete Confirmation Modal */}
 <AnimatePresence>
 {deleteConfirmId && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
 <motion.div 
 initial={{ opacity: 0 }} 
 animate={{ opacity: 1 }} 
 exit={{ opacity: 0 }} 
 className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
 onClick={() => setDeleteConfirmId(null)}
 />
 <motion.div 
 initial={{ opacity: 0, scale: 0.95, y: 20 }} 
 animate={{ opacity: 1, scale: 1, y: 0 }} 
 exit={{ opacity: 0, scale: 0.95, y: 20 }} 
 className="bg-white rounded-xl shadow-xl w-full max-w-md relative z-10 overflow-hidden"
 >
 <div className="p-6">
 <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4 mx-auto">
 <Trash2 className="w-6 h-6 text-red-600" />
 </div>
 <h3 className="text-lg font-bold text-slate-900 text-center mb-2">Excluir lançamento?</h3>
 <p className="text-sm text-slate-500 text-center mb-6">
 Tem certeza que deseja apagar este lançamento? Esta ação removerá a visita permanentemente. <br/><br/><strong>Atenção:</strong> Se este for o único lançamento do lote, o lote também será excluído.
 </p>
 <div className="flex gap-3">
 <button 
 onClick={() => setDeleteConfirmId(null)}
 className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
 >
 Cancelar
 </button>
 <button 
 onClick={() => {
 if (deleteConfirmId) onDeleteVisit(deleteConfirmId);
 setDeleteConfirmId(null);
 }}
 className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
 >
 Sim, excluir
 </button>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>
 </div>
 );
}
