import React, { useState } from 'react';
import { Integrado } from '../types';

interface IntegradoFormProps {
  onSave: (integrado: Integrado) => void;
  onCancel: () => void;
}

export function IntegradoForm({ onSave, onCancel }: IntegradoFormProps) {
  const [name, setName] = useState('');
  const [loteNumber, setLoteNumber] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState<'Em andamento' | 'Fechado'>('Em andamento');
  const [fechamentoDate, setFechamentoDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !date) return;
    onSave({
      id: `i_${Date.now()}`,
      name,
      loteNumber,
      alojamentoDate: date,
      status,
      fechamentoDate: status === 'Fechado' ? fechamentoDate : undefined,
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-2">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800">Novo Integrado</h3>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
          ✕
        </button>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row flex-wrap items-end gap-4">
        <div className="flex-1 space-y-2 min-w-[200px]">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Nome do Integrado</label>
          <input 
            type="text" 
            required
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Ex: Aquiles Mantovani"
          />
        </div>
        <div className="flex-1 space-y-2 min-w-[100px] max-w-[150px]">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Lote</label>
          <input 
            type="text" 
            value={loteNumber}
            onChange={e => setLoteNumber(e.target.value)}
            className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Ex: 123"
          />
        </div>
        <div className="flex-1 space-y-2 min-w-[150px]">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Data de Alojamento</label>
          <input 
            type="date" 
            required
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="flex-1 space-y-2 min-w-[150px]">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Status</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value as 'Em andamento' | 'Fechado')}
            className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="Em andamento">Em andamento</option>
            <option value="Fechado">Fechado</option>
          </select>
        </div>
        {status === 'Fechado' && (
          <div className="flex-1 space-y-2 min-w-[150px]">
            <label className="block text-xs font-semibold text-slate-500 mb-1">Data de Fechamento</label>
            <input 
              type="date" 
              required
              value={fechamentoDate}
              onChange={e => setFechamentoDate(e.target.value)}
              className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        )}
        <button type="submit" className="w-full md:w-auto bg-blue-600 text-white py-2 px-6 rounded text-sm font-semibold hover:bg-blue-700 transition">
          Salvar
        </button>
      </form>
    </div>
  );
}
