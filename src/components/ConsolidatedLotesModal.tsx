import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { X, Search, FileText, Calendar } from 'lucide-react';
import { Integrado, Visit } from '../types';

interface ConsolidatedLotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  integrados: Integrado[];
  visits: Visit[];
  onGenerate: (selectedLotes: Integrado[]) => void;
}

export function ConsolidatedLotesModal({
  isOpen,
  onClose,
  integrados,
  visits,
  onGenerate
}: ConsolidatedLotesModalProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLoteIds, setSelectedLoteIds] = useState<Set<string>>(new Set());

  // Filter lots based on their details and their visits' dates
  const filteredLotes = useMemo(() => {
    return integrados.filter(l => {
      const nameMatch = l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       (l.loteNumber && l.loteNumber.toLowerCase().includes(searchTerm.toLowerCase()));
      
      let dateMatch = true;
      if (startDate || endDate) {
        // If date filter is applied, check if the lot has visits in this date range
        const lotVisits = visits.filter(v => v.integradoId === l.id);
        const hasVisitInRange = lotVisits.some(v => {
          let match = true;
          if (startDate && v.date < startDate) match = false;
          if (endDate && v.date > endDate) match = false;
          return match;
        });
        
        // OR check if the alojamento date matches
        let alojamentoMatch = true;
        if (startDate && l.alojamentoDate < startDate) alojamentoMatch = false;
        if (endDate && l.alojamentoDate > endDate) alojamentoMatch = false;
        
        dateMatch = hasVisitInRange || alojamentoMatch;
      }
      
      return nameMatch && dateMatch;
    }).sort((a, b) => new Date(b.alojamentoDate).getTime() - new Date(a.alojamentoDate).getTime());
  }, [integrados, visits, searchTerm, startDate, endDate]);

  const handleSelectAll = () => {
    if (selectedLoteIds.size === filteredLotes.length && filteredLotes.length > 0) {
      setSelectedLoteIds(new Set());
    } else {
      setSelectedLoteIds(new Set(filteredLotes.map(l => l.id)));
    }
  };

  const handleToggleSelect = (id: string) => {
    const newSet = new Set(selectedLoteIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedLoteIds(newSet);
  };

  const handleGenerate = () => {
    const selected = integrados.filter(l => selectedLoteIds.has(l.id));
    onGenerate(selected);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Gerar Relatório Consolidado de Lotes
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-slate-200 bg-slate-50 space-y-4">
          <p className="text-sm text-slate-600">
            Filtre os lotes por data de alojamento ou data das visitas. O relatório gerado conterá uma capa de resumo com a média dos indicadores e o detalhamento individual de cada lote selecionado.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou nº do lote..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                />
              </div>
              <span className="text-slate-400">-</span>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-0">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold sticky top-0 border-b border-slate-200 shadow-sm">
              <tr>
                <th className="px-4 py-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={filteredLotes.length > 0 && selectedLoteIds.size === filteredLotes.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3">Nº Lote</th>
                <th className="px-4 py-3">Produtor</th>
                <th className="px-4 py-3">Alojamento</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLotes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    Nenhum lote encontrado com os filtros atuais.
                  </td>
                </tr>
              ) : (
                filteredLotes.map(l => {
                  const isSelected = selectedLoteIds.has(l.id);
                  return (
                    <tr 
                      key={l.id} 
                      className={`border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50/30' : ''}`}
                      onClick={() => handleToggleSelect(l.id)}
                    >
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(l.id)} 
                          onClick={(e) => e.stopPropagation()} 
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700">{l.loteNumber || '-'}</td>
                      <td className="px-4 py-3">{l.name}</td>
                      <td className="px-4 py-3">{new Date(l.alojamentoDate + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          l.status === 'Em andamento' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between">
          <span className="text-sm text-slate-600 font-medium">
            {selectedLoteIds.size} lote(s) selecionado(s)
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-semibold"
            >
              Cancelar
            </button>
            <button
              onClick={handleGenerate}
              disabled={selectedLoteIds.size === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Gerar Relatório Consolidado
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
