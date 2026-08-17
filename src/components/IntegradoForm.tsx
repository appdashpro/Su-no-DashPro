import React, { useState, useEffect } from 'react';
import { Integrado, Empresa } from '../types';
import { supabase } from '../lib/supabase';

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
  
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [selectedEmpresaId, setSelectedEmpresaId] = useState('');

  useEffect(() => {
    async function loadEmpresas() {
      // 1. Load from cache immediately
      try {
        const cachedStr = localStorage.getItem('suino_dashpro_empresas_cache');
        if (cachedStr) {
          const cached = JSON.parse(cachedStr);
          if (cached && cached.length > 0) {
            setEmpresas(cached);
            const pastre = cached.find((e: Empresa) => e.nome.includes('Pastre'));
            if (pastre) setSelectedEmpresaId(pastre.id);
            else setSelectedEmpresaId(cached[0].id);
          }
        }
      } catch (e) {}

      // 2. Fetch from Supabase
      try {
        const { data, error } = await supabase
          .from('empresas')
          .select('*')
          .eq('ativo', true)
          .eq('tipo', 'CLIENTE')
          .order('nome');
        
        if (data && !error) {
          setEmpresas(data);
          try {
             localStorage.setItem('suino_dashpro_empresas_cache', JSON.stringify(data));
          } catch(e) {}
          
          if (!selectedEmpresaId) {
             const pastre = data.find(e => e.nome.includes('Pastre'));
             if (pastre) {
               setSelectedEmpresaId(pastre.id);
             } else if (data.length > 0) {
               setSelectedEmpresaId(data[0].id);
             }
          }
        }
      } catch (err) {
        console.error('Erro ao carregar empresas:', err);
      }
    }
    loadEmpresas();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !date || !selectedEmpresaId) return;
    
    const selectedEmp = empresas.find(emp => emp.id === selectedEmpresaId);
    
    onSave({
      id: `i_${Date.now()}`,
      name,
      loteNumber,
      alojamentoDate: date,
      status,
      fechamentoDate: status === 'Fechado' ? fechamentoDate : undefined,
      empresaId: selectedEmpresaId,
      empresaName: selectedEmp?.nome
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-2">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800">Novo Integrado / Lote</h3>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
          ✕
        </button>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row flex-wrap items-end gap-4">
          <div className="flex-1 space-y-2 min-w-[200px]">
            <label className="block text-xs font-semibold text-slate-500 mb-1">Cliente (Empresa)</label>
            <select
              required
              value={selectedEmpresaId}
              onChange={e => setSelectedEmpresaId(e.target.value)}
              className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="" disabled>Selecione o Cliente</option>
              {empresas.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.nome}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 space-y-2 min-w-[200px]">
            <label className="block text-xs font-semibold text-slate-500 mb-1">Nome do Integrado (Produtor)</label>
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
        </div>

        <div className="flex flex-col md:flex-row flex-wrap items-end gap-4">
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
          <button type="submit" className="w-full md:w-auto bg-blue-600 text-white py-2 px-6 rounded text-sm font-semibold hover:bg-blue-700 transition self-end">
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
}
