import { generateUUID } from "../utils/uuid";
import React, { useState, useEffect } from 'react';
import { Package, Plus, Trash2, DollarSign } from 'lucide-react';
import { VisitaEntrega, CatalogoProduto } from '../types';
import { supabase } from '../lib/supabase';


interface Props {
  empresaId: string;
  entregas: VisitaEntrega[];
  onChange: (entregas: VisitaEntrega[]) => void;
}

export function EntregasFormSection({ empresaId, entregas, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [catalogo, setCatalogo] = useState<CatalogoProduto[]>([]);
  const [loading, setLoading] = useState(false);
  
  // We should cache catalog in localStorage for offline, but for this MVP let's fetch or use cache if available.
  useEffect(() => {
    if (empresaId && isOpen) {
      loadCatalogo();
    }
  }, [empresaId, isOpen]);

  const loadCatalogo = async () => {
    setLoading(true);
    try {
      const cached = localStorage.getItem(`catalogo_${empresaId}`);
      if (cached) setCatalogo(JSON.parse(cached));
      
      if (navigator.onLine) {
        const { data } = await supabase.from('catalogo_produtos').select('*').eq('empresa_id', empresaId).eq('ativo', true);
        if (data) {
          setCatalogo(data);
          localStorage.setItem(`catalogo_${empresaId}`, JSON.stringify(data));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addEntrega = () => {
    onChange([...entregas, { id: generateUUID(), produto_id: '', quantidade: 1, valor_unitario_aplicado: 0 }]);
  };

  const removeEntrega = (id: string) => {
    onChange(entregas.filter(e => e.id !== id));
  };

  const updateEntrega = (id: string, field: keyof VisitaEntrega, value: any) => {
    onChange(entregas.map(e => {
      if (e.id === id) {
        const updated = { ...e, [field]: value };
        if (field === 'produto_id') {
          const prod = catalogo.find(p => p.id === value);
          if (prod) {
            updated.valor_unitario_aplicado = prod.preco_base;
            updated.produto_nome = prod.nome;
          }
        }
        return updated;
      }
      return e;
    }));
  };

  const total = entregas.reduce((acc, curr) => acc + ((Number(curr.quantidade)||0) * (Number(curr.valor_unitario_aplicado)||0)), 0);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mt-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-slate-800">📦 Insumos Deixados / Faturamento</h3>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
          <span>{entregas.length} itens</span>
          <span className="text-emerald-600">R$ {total.toFixed(2)}</span>
        </div>
      </button>

      {isOpen && (
        <div className="p-4 space-y-4 border-t border-slate-200">
          {entregas.map((entrega, index) => (
            <div key={entrega.id} className="flex flex-col sm:flex-row gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-500 mb-1">Produto</label>
                <select
                  value={entrega.produto_id}
                  onChange={e => updateEntrega(entrega.id, 'produto_id', e.target.value)}
                  className="w-full text-sm p-2 rounded border border-slate-300"
                >
                  <option value="">Selecione...</option>
                  {catalogo.map(p => (
                    <option key={p.id} value={p.id}>{p.nome} ({p.unidade_medida}) - R$ {p.preco_base}</option>
                  ))}
                  {entrega.produto_id && !catalogo.find(p => p.id === entrega.produto_id) && (
                    <option value={entrega.produto_id}>{entrega.produto_nome || 'Produto Indisponível'}</option>
                  )}
                </select>
              </div>
              <div className="w-full sm:w-24">
                <label className="block text-xs font-medium text-slate-500 mb-1">Quantidade</label>
                <input
                  type="number"
                  step="0.01"
                  value={entrega.quantidade}
                  onChange={e => updateEntrega(entrega.id, 'quantidade', parseFloat(e.target.value) || 0)}
                  className="w-full text-sm p-2 rounded border border-slate-300"
                />
              </div>
              <div className="w-full sm:w-32">
                <label className="block text-xs font-medium text-slate-500 mb-1">Total (R$)</label>
                <div className="text-sm font-semibold text-slate-800 pt-2">
                  R$ {((Number(entrega.quantidade)||0) * (Number(entrega.valor_unitario_aplicado)||0)).toFixed(2)}
                </div>
              </div>
              <div className="pt-5">
                <button type="button" onClick={() => removeEntrega(entrega.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addEntrega}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <Plus className="w-4 h-4" /> Adicionar Produto Entregue
          </button>
        </div>
      )}
    </div>
  );
}
