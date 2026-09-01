import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Trash2, Edit2, Save, X, Package, DollarSign } from 'lucide-react';

export function CatalogoGestao({ empresaId }: { empresaId: string }) {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ nome: '', categoria: 'Insumo', unidade_medida: 'Unidade', preco_base: 0 });

  useEffect(() => {
    if (empresaId) loadProdutos();
  }, [empresaId]);

  const loadProdutos = async () => {
    setLoading(true);
    const { data } = await supabase.from('catalogo_produtos').select('*').eq('empresa_id', empresaId).eq('ativo', true).order('nome');
    setProdutos(data || []);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!editForm.nome) return;
    if (editingId === 'new') {
      await supabase.from('catalogo_produtos').insert({
        empresa_id: empresaId,
        nome: editForm.nome,
        categoria: editForm.categoria,
        unidade_medida: editForm.unidade_medida,
        preco_base: editForm.preco_base
      });
    } else {
      await supabase.from('catalogo_produtos').update({
        nome: editForm.nome,
        categoria: editForm.categoria,
        unidade_medida: editForm.unidade_medida,
        preco_base: editForm.preco_base
      }).eq('id', editingId);
    }
    setEditingId(null);
    loadProdutos();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este produto?')) return;
    await supabase.from('catalogo_produtos').update({ ativo: false }).eq('id', id);
    loadProdutos();
  };

  if (!empresaId) return <div className="p-4 text-slate-500">Selecione uma empresa primeiro.</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-800">Catálogo de Produtos</h3>
        <button onClick={() => { setEditingId('new'); setEditForm({ nome: '', categoria: 'Insumo', unidade_medida: 'Unidade', preco_base: 0 }); }} className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Novo Produto
        </button>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="bg-slate-50 text-slate-700 border-b">
            <tr>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Unidade</th>
              <th className="px-4 py-3">Preço Base (R$)</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {editingId === 'new' && (
              <tr className="bg-blue-50/30">
                <td className="px-4 py-2"><input type="text" className="border p-1 w-full rounded" value={editForm.nome} onChange={e => setEditForm({...editForm, nome: e.target.value})} placeholder="Ex: Tylan 50ml" /></td>
                <td className="px-4 py-2">
                  <select className="border p-1 rounded" value={editForm.categoria} onChange={e => setEditForm({...editForm, categoria: e.target.value})}>
                    <option value="Injetável">Injetável</option><option value="Vacina">Vacina</option><option value="Insumo">Insumo</option><option value="Equipamento">Equipamento</option>
                  </select>
                </td>
                <td className="px-4 py-2"><input type="text" className="border p-1 w-full rounded" value={editForm.unidade_medida} onChange={e => setEditForm({...editForm, unidade_medida: e.target.value})} placeholder="Frasco" /></td>
                <td className="px-4 py-2"><input type="number" step="0.01" className="border p-1 w-full rounded" value={editForm.preco_base} onChange={e => setEditForm({...editForm, preco_base: parseFloat(e.target.value) || 0})} /></td>
                <td className="px-4 py-2 text-right">
                  <button onClick={handleSave} className="text-emerald-600 mr-2"><Save className="w-4 h-4" /></button>
                  <button onClick={() => setEditingId(null)} className="text-red-600"><X className="w-4 h-4" /></button>
                </td>
              </tr>
            )}
            {produtos.map(p => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-slate-50">
                {editingId === p.id ? (
                  <>
                    <td className="px-4 py-2"><input type="text" className="border p-1 w-full rounded" value={editForm.nome} onChange={e => setEditForm({...editForm, nome: e.target.value})} /></td>
                    <td className="px-4 py-2">
                      <select className="border p-1 rounded" value={editForm.categoria} onChange={e => setEditForm({...editForm, categoria: e.target.value})}>
                        <option value="Injetável">Injetável</option><option value="Vacina">Vacina</option><option value="Insumo">Insumo</option><option value="Equipamento">Equipamento</option>
                      </select>
                    </td>
                    <td className="px-4 py-2"><input type="text" className="border p-1 w-full rounded" value={editForm.unidade_medida} onChange={e => setEditForm({...editForm, unidade_medida: e.target.value})} /></td>
                    <td className="px-4 py-2"><input type="number" step="0.01" className="border p-1 w-full rounded" value={editForm.preco_base} onChange={e => setEditForm({...editForm, preco_base: parseFloat(e.target.value) || 0})} /></td>
                    <td className="px-4 py-2 text-right">
                      <button onClick={handleSave} className="text-emerald-600 mr-2"><Save className="w-4 h-4" /></button>
                      <button onClick={() => setEditingId(null)} className="text-slate-400"><X className="w-4 h-4" /></button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 font-medium text-slate-800">{p.nome}</td>
                    <td className="px-4 py-3 text-slate-600"><span className="px-2 py-0.5 bg-slate-100 rounded-full text-xs">{p.categoria}</span></td>
                    <td className="px-4 py-3 text-slate-600">{p.unidade_medida}</td>
                    <td className="px-4 py-3 text-slate-600 font-medium">R$ {p.preco_base.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => { setEditingId(p.id); setEditForm({ nome: p.nome, categoria: p.categoria, unidade_medida: p.unidade_medida, preco_base: p.preco_base }); }} className="text-blue-600 p-1 hover:bg-blue-50 rounded mr-1"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(p.id)} className="text-red-600 p-1 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {produtos.length === 0 && editingId !== 'new' && !loading && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Nenhum produto cadastrado no catálogo deste cliente.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
