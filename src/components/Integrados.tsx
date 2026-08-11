import React, { useState, useMemo } from 'react';
import { Integrado, Visit } from '../types';
import { getExpectedConsumption } from '../data';
import { Users, ClipboardList, Search, Filter, ArrowUpDown, Calendar, AlertCircle, CheckCircle2, Clock, X, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { AnimatePresence, motion } from 'motion/react';

interface IntegradosProps {
  integrados: Integrado[];
  visits: Visit[];
  totalVisits: number;
  onUpdate: (integrado: Integrado) => void;
  onDelete: (id: string) => void;
}

export function Integrados({ integrados, visits, totalVisits, onUpdate, onDelete }: IntegradosProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editLoteNumber, setEditLoteNumber] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editStatus, setEditStatus] = useState<'Em andamento' | 'Fechado'>('Em andamento');
  const [editFechamentoDate, setEditFechamentoDate] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'Todos' | 'Em andamento' | 'Fechado'>('Todos');
  const [filterVisitStatus, setFilterVisitStatus] = useState<'Todos' | 'Em dia' | 'Atenção' | 'Atrasado'>('Todos');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'name-asc' | 'name-desc' | 'atraso-desc' | 'atraso-asc'>('date-desc');

  const processedData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return integrados.map(integrado => {
      const loteVisits = visits.filter(v => v.integradoId === integrado.id)
                               .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      const lastVisit = loteVisits.length > 0 ? loteVisits[0] : null;
      
      const alojamentoDate = new Date(integrado.alojamentoDate + 'T12:00:00');
      const diffTime = today.getTime() - alojamentoDate.getTime();
      const diasLote = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
      
      let diasSemVisita = diasLote;
      if (lastVisit) {
         const visitDate = new Date(lastVisit.date + 'T12:00:00');
         const diffVisit = today.getTime() - visitDate.getTime();
         diasSemVisita = Math.max(0, Math.floor(diffVisit / (1000 * 60 * 60 * 24)));
      }

      let visitStatusStr: 'Em dia' | 'Atenção' | 'Atrasado' | 'N/A' = 'N/A';
      if (integrado.status === 'Em andamento') {
        if (diasSemVisita >= 15) visitStatusStr = 'Atrasado';
        else if (diasSemVisita >= 11) visitStatusStr = 'Atenção';
        else visitStatusStr = 'Em dia';
      }

      return {
        ...integrado,
        lastVisit,
        diasLote,
        diasSemVisita,
        visitStatusStr
      };
    }).filter(i => {
      if (filterStatus !== 'Todos' && i.status !== filterStatus) return false;
      if (filterVisitStatus !== 'Todos' && i.visitStatusStr !== filterVisitStatus) return false;
      if (searchTerm && !(i.name || '').toLowerCase().includes(searchTerm.toLowerCase()) && !(i.loteNumber && (i.loteNumber || '').toLowerCase().includes(searchTerm.toLowerCase()))) return false;
      return true;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'date-desc': return new Date(b.alojamentoDate).getTime() - new Date(a.alojamentoDate).getTime();
        case 'date-asc': return new Date(a.alojamentoDate).getTime() - new Date(b.alojamentoDate).getTime();
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        case 'atraso-desc': return b.diasSemVisita - a.diasSemVisita;
        case 'atraso-asc': return a.diasSemVisita - b.diasSemVisita;
        default: return 0;
      }
    });
  }, [integrados, visits, filterStatus, filterVisitStatus, searchTerm, sortBy]);


  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-3 border-b border-slate-200 bg-slate-50 flex flex-wrap gap-3 justify-between items-center">
          <div className="flex flex-wrap items-center gap-2 w-full">
            <div className="relative w-full sm:w-56">
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nome ou lote..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-md px-2 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 font-medium"
            >
              <option value="Todos">Status</option>
              <option value="Em andamento">Em andamento</option>
              <option value="Fechado">Fechado</option>
            </select>
            
            {filterStatus !== 'Fechado' && (
              <select
                value={filterVisitStatus}
                onChange={e => setFilterVisitStatus(e.target.value as any)}
                className="bg-white border border-slate-200 rounded-md px-2 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 font-medium"
              >
                <option value="Todos">Visitas (Todas)</option>
                <option value="Em dia">Em dia</option>
                <option value="Atenção">Atenção</option>
                <option value="Atrasado">Atrasado</option>
              </select>
            )}

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-md px-2 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 font-medium"
            >
              <option value="date-desc">Recentes</option>
              <option value="date-asc">Antigos</option>
              <option value="name-asc">Nome (A-Z)</option>
              <option value="name-desc">Nome (Z-A)</option>
              <option value="atraso-desc">Maior Atraso</option>
              <option value="atraso-asc">Menor Atraso</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 min-w-[900px] relative">
            <thead className="bg-slate-50 text-slate-700 font-medium border-b border-slate-200 sticky top-0 z-20 shadow-sm">
              <tr>
                <th className="px-3 py-2 text-xs whitespace-nowrap bg-slate-50">Lote</th>
                <th className="px-3 py-2 text-xs whitespace-nowrap bg-slate-50">Nome</th>
                <th className="px-3 py-2 text-xs whitespace-nowrap bg-slate-50">Status Lote</th>
                <th className="px-3 py-2 text-xs whitespace-nowrap bg-slate-50">Alojamento/Fech.</th>
                <th className="px-3 py-2 text-xs text-right whitespace-nowrap bg-slate-50">Idade</th>
                <th className="px-3 py-2 text-xs whitespace-nowrap bg-slate-50 text-center">Status Visita</th>
                <th className="px-3 py-2 text-xs text-right whitespace-nowrap bg-slate-50">Última Visita</th>
                <th className="px-3 py-2 text-xs text-right whitespace-nowrap bg-slate-50">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence>
              {processedData.map(i => {
                let consumoStr = '-';
                let consumoColor = 'text-slate-500';
                let consumoBg = 'bg-slate-100';
                let diferencaStr = '';

                if (i.lastVisit) {
                  if (i.lastVisit.consumoAcumuladoReal !== undefined && i.lastVisit.consumoAcumuladoReal !== null && Number(i.lastVisit.consumoAcumuladoReal) > 0) {
                    const expected = getExpectedConsumption(Number(i.lastVisit.idade), i.lastVisit.tipoLote, i.lastVisit.pesoAloj, i.alojamentoDate, i.status, i.fechamentoDate);
                    const realVal = Number(i.lastVisit.consumoAcumuladoReal);
                    const diff = realVal - (expected || 0);
                    consumoStr = `${realVal.toFixed(2)} kg`;
                    diferencaStr = expected ? (diff > 0 ? `(+${diff.toFixed(2)} kg)` : `(${diff.toFixed(2)} kg)`) : '';
                    if (expected) {
                      if (diff >= -5 && diff <= 5) {
                        consumoColor = 'text-blue-700';
                        consumoBg = 'bg-blue-100';
                      } else if (diff > 5) {
                        consumoColor = 'text-red-700';
                        consumoBg = 'bg-red-100';
                      } else {
                        consumoColor = 'text-emerald-700';
                        consumoBg = 'bg-emerald-100';
                      }
                    }
                  }
                }

                let statusColor = "text-emerald-600 bg-emerald-50 border-emerald-200";
                let StatusIcon = CheckCircle2;
                
                if (i.visitStatusStr === 'Atrasado') {
                   statusColor = "text-red-600 bg-red-50 border-red-200";
                   StatusIcon = AlertCircle;
                } else if (i.visitStatusStr === 'Atenção') {
                   statusColor = "text-amber-600 bg-amber-50 border-amber-200";
                   StatusIcon = Clock;
                }

                return (
                  <motion.tr 
                    layout 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }} 
                    key={i.id} 
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-3 py-2 whitespace-nowrap font-medium text-slate-700">
                      {editingId === i.id ? (
                        <input 
                          type="text" 
                          value={editLoteNumber}
                          onChange={e => setEditLoteNumber(e.target.value)}
                          className="border border-slate-300 rounded px-2 py-1 text-sm w-20 outline-none focus:border-blue-500"
                        />
                      ) : (
                        i.loteNumber || '-'
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap font-medium text-slate-900">
                      {editingId === i.id ? (
                        <input 
                          type="text" 
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="border border-slate-300 rounded px-2 py-1 text-sm w-full outline-none focus:border-blue-500"
                        />
                      ) : (
                        i.name
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {editingId === i.id ? (
                        <select 
                          value={editStatus}
                          onChange={e => setEditStatus(e.target.value as 'Em andamento' | 'Fechado')}
                          className="border border-slate-300 rounded px-2 py-1 text-sm outline-none focus:border-blue-500 bg-white"
                        >
                          <option value="Em andamento">Em andamento</option>
                          <option value="Fechado">Fechado</option>
                        </select>
                      ) : (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${i.status === 'Fechado' ? 'bg-slate-100 text-slate-800' : 'bg-green-100 text-green-800'}`}>
                          {i.status}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {editingId === i.id ? (
                        <div className="flex flex-col gap-2">
                          <input 
                            type="date" 
                            value={editDate}
                            onChange={e => setEditDate(e.target.value)}
                            className="border border-slate-300 rounded px-2 py-1 text-sm w-full outline-none focus:border-blue-500"
                          />
                          {editStatus === 'Fechado' && (
                            <input 
                              type="date" 
                              value={editFechamentoDate}
                              onChange={e => setEditFechamentoDate(e.target.value)}
                              className="border border-slate-300 rounded px-2 py-1 text-sm w-full outline-none focus:border-blue-500"
                            />
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col text-xs text-slate-500">
                          <span>Aloj: {new Date(i.alojamentoDate + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                          {i.status === 'Fechado' && i.fechamentoDate && (
                            <span>Fech: {new Date(i.fechamentoDate + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right whitespace-nowrap">
                      <span>{i.status === 'Fechado' && i.fechamentoDate 
                        ? `${Math.max(0, Math.round((new Date(i.fechamentoDate + 'T12:00:00').getTime() - new Date(i.alojamentoDate + 'T12:00:00').getTime()) / (1000 * 60 * 60 * 24)))} dias`
                        : `${i.diasLote} dias`}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-center">
                      {i.status === 'Em andamento' ? (
                        <div className={cn("inline-flex flex-col items-center justify-center gap-1 px-2.5 py-1 rounded text-xs font-medium border", statusColor)}>
                          <div className="flex items-center gap-1">
                            <StatusIcon className="w-3 h-3" />
                            {i.visitStatusStr}
                          </div>
                          <span className="text-[10px] opacity-80">{i.diasSemVisita} dias s/ visita</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right whitespace-nowrap">
                      {i.lastVisit ? (
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-sm font-medium text-slate-700">
                            {new Date(i.lastVisit.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                          </span>
                          <span className="text-xs text-slate-500">
                            Idade: {i.lastVisit.idade} dias
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right whitespace-nowrap">
                      {editingId === i.id ? (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => {
                              onUpdate({ 
                                ...i, 
                                name: editName, 
                                loteNumber: editLoteNumber, 
                                alojamentoDate: editDate,
                                status: editStatus,
                                fechamentoDate: editStatus === 'Fechado' ? editFechamentoDate : undefined
                              });
                              setEditingId(null);
                            }}
                            className="text-blue-600 font-semibold hover:text-blue-700 text-xs px-2 py-1 border border-blue-600 rounded"
                          >
                            Salvar
                          </button>
                          <button 
                            onClick={() => setEditingId(null)}
                            className="text-slate-500 font-semibold hover:text-slate-700 text-xs px-2 py-1 border border-slate-300 rounded"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-3">
                          <button 
                            onClick={() => {
                              setEditingId(i.id);
                              setEditName(i.name);
                              setEditLoteNumber(i.loteNumber || '');
                              setEditDate(i.alojamentoDate);
                              setEditStatus(i.status);
                              setEditFechamentoDate(i.fechamentoDate || '');
                              setDeleteConfirmId(null);
                            }}
                            className="text-blue-500 hover:text-blue-700 text-xs uppercase font-bold tracking-wider"
                          >
                            Editar
                          </button>
                          <button 
                            onClick={() => setDeleteConfirmId(i.id)}
                            className="text-red-500 hover:text-red-700 text-xs uppercase font-bold tracking-wider"
                          >
                            Apagar
                          </button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                )
              })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {processedData.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            Nenhum lote encontrado com os filtros atuais.
          </div>
        )}
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
                <h3 className="text-lg font-bold text-slate-900 text-center mb-2">Excluir lote?</h3>
                <p className="text-sm text-slate-500 text-center mb-6">
                  Tem certeza que deseja apagar este lote? Esta ação removerá o lote permanentemente e não poderá ser desfeita.
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
                      if (deleteConfirmId) onDelete(deleteConfirmId);
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
