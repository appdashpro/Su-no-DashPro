import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, FileText, Calendar } from 'lucide-react';
import { Visit, Integrado, Empresa } from '../types';

interface ConsolidatedVisitasModalProps {
  isOpen: boolean;
  onClose: () => void;
  visits: Visit[];
  integrados: Integrado[];
  empresas: Empresa[];
  onGenerate: (selectedVisits: Visit[]) => void;
}

export function ConsolidatedVisitasModal({
  isOpen,
  onClose,
  visits,
  integrados,
  empresas,
  onGenerate
}: ConsolidatedVisitasModalProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVisitIds, setSelectedVisitIds] = useState<Set<string>>(new Set());

  const filteredVisits = useMemo(() => {
    return visits.filter(v => {
      const produtor = integrados.find(i => i.id === v.integradoId)?.name.toLowerCase() || '';
      const matchesSearch = produtor.includes(searchTerm.toLowerCase()) || (v.colaborador && v.colaborador.toLowerCase().includes(searchTerm.toLowerCase()));
      
      let matchesDate = true;
      if (startDate && v.date < startDate) matchesDate = false;
      if (endDate && v.date > endDate) matchesDate = false;
      
      return matchesSearch && matchesDate;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [visits, integrados, searchTerm, startDate, endDate]);

  const handleSelectAll = () => {
    if (selectedVisitIds.size === filteredVisits.length) {
      setSelectedVisitIds(new Set());
    } else {
      setSelectedVisitIds(new Set(filteredVisits.map(v => v.id)));
    }
  };

  const handleToggleSelect = (id: string) => {
    const newSet = new Set(selectedVisitIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedVisitIds(newSet);
  };

  const handleGenerate = () => {
    const selected = visits.filter(v => selectedVisitIds.has(v.id));
    onGenerate(selected);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Gerar PDF Consolidado de Visitas
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-slate-200 bg-slate-50 space-y-4">
          <p className="text-sm text-slate-600">
            Filtre e selecione as visitas. O PDF gerado conterá uma página inicial de resumo, seguida pelos relatórios individuais de cada visita selecionada.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar produtor ou técnico..."
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
                    checked={filteredVisits.length > 0 && selectedVisitIds.size === filteredVisits.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Produtor</th>
                <th className="px-4 py-3">Idade</th>
                <th className="px-4 py-3">Técnico</th>
              </tr>
            </thead>
            <tbody>
              {filteredVisits.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    Nenhuma visita encontrada com os filtros atuais.
                  </td>
                </tr>
              ) : (
                filteredVisits.map(v => {
                  const produtor = integrados.find(i => i.id === v.integradoId)?.name || 'Desconhecido';
                  const isSelected = selectedVisitIds.has(v.id);
                  return (
                    <tr 
                      key={v.id} 
                      className={`border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50/30' : ''}`}
                      onClick={() => handleToggleSelect(v.id)}
                    >
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(v.id)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                          onClick={(e) => e.stopPropagation()} // Let the row handle it but prevent double fire if we wanted
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700">
                        {new Date(v.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3">{produtor}</td>
                      <td className="px-4 py-3">{v.idade ? `${v.idade} dias` : '-'}</td>
                      <td className="px-4 py-3">{v.colaborador || '-'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between">
          <span className="text-sm text-slate-600 font-medium">
            {selectedVisitIds.size} visita(s) selecionada(s)
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
              disabled={selectedVisitIds.size === 0}
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
