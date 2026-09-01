import React, { useState, useMemo } from 'react';
import { Download, Search, Check, DollarSign, Package } from 'lucide-react';
import { Visit, Integrado } from '../types';

interface Props {
  visits: Visit[];
  integrados: Integrado[];
}

export function FaturamentoGestao({ visits, integrados }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const entregas = useMemo(() => {
    const list: any[] = [];
    visits.forEach(v => {
      if (v.entregas && v.entregas.length > 0) {
        const produtor = integrados.find(i => i.id === v.integradoId)?.name || 'Produtor Desconhecido';
        v.entregas.forEach(e => {
          list.push({
            ...e,
            visitDate: v.date,
            produtor,
            tecnico: v.colaborador || 'Não informado',
            total: (Number(e.quantidade) || 0) * (Number(e.valor_unitario_aplicado) || 0)
          });
        });
      }
    });
    return list.sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());
  }, [visits, integrados]);

  const filteredEntregas = useMemo(() => {
    return entregas.filter(e => 
      e.produtor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.produto_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.tecnico.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [entregas, searchTerm]);

  // agrupar por produtor
  const agrupadoPorProdutor = useMemo(() => {
    const map = new Map<string, typeof filteredEntregas>();
    filteredEntregas.forEach(e => {
      const arr = map.get(e.produtor) || [];
      arr.push(e);
      map.set(e.produtor, arr);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filteredEntregas]);

  const totalGeral = filteredEntregas.reduce((acc, curr) => acc + curr.total, 0);

  const handleExport = () => {
    let csv = 'Data,Produtor,Produto,Quantidade,Valor Unitário,Total,Técnico,Status\n';
    filteredEntregas.forEach(e => {
      csv += `${e.visitDate},"${e.produtor}","${e.produto_nome || e.produto_id}",${e.quantidade},${e.valor_unitario_aplicado},${e.total},"${e.tecnico}",${e.status_faturamento || 'Pendente'}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `faturamento_${new Date().getTime()}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-600" />
            Faturamento e Acerto de Contas
          </h1>
          <p className="text-slate-500 mt-1">Visualize produtos e insumos entregues nas granjas para cobrança.</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50"
        >
          <Download className="w-4 h-4" /> Exportar Planilha (CSV)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por produtor, técnico ou produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>
        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex flex-col justify-center">
          <h3 className="text-sm font-medium text-emerald-800 mb-1">Total a Faturar (Filtrado)</h3>
          <p className="text-3xl font-bold text-emerald-600">
            R$ {totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {agrupadoPorProdutor.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            Nenhuma entrega registrada ou encontrada na busca.
          </div>
        ) : (
          agrupadoPorProdutor.map(([produtor, entregasProdutor]) => {
            const totalProdutor = entregasProdutor.reduce((acc, curr) => acc + curr.total, 0);
            return (
              <div key={produtor} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800">{produtor}</h3>
                  <span className="font-semibold text-emerald-600">R$ {totalProdutor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="p-0 overflow-x-auto">
                  <table className="w-full text-sm text-left text-slate-600">
                    <thead className="bg-white border-b border-slate-100">
                      <tr>
                        <th className="px-4 py-3 font-medium text-slate-500">Data</th>
                        <th className="px-4 py-3 font-medium text-slate-500">Produto</th>
                        <th className="px-4 py-3 font-medium text-slate-500 text-right">Qtd</th>
                        <th className="px-4 py-3 font-medium text-slate-500 text-right">Unitário</th>
                        <th className="px-4 py-3 font-medium text-slate-500 text-right">Total</th>
                        <th className="px-4 py-3 font-medium text-slate-500">Técnico</th>
                        <th className="px-4 py-3 font-medium text-slate-500 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {entregasProdutor.map((e, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 whitespace-nowrap">{new Date(e.visitDate).toLocaleDateString('pt-BR')}</td>
                          <td className="px-4 py-3 font-medium text-slate-700">{e.produto_nome || 'Produto não encontrado'}</td>
                          <td className="px-4 py-3 text-right">{e.quantidade}</td>
                          <td className="px-4 py-3 text-right">R$ {e.valor_unitario_aplicado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          <td className="px-4 py-3 text-right font-medium text-slate-800">R$ {e.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          <td className="px-4 py-3 text-slate-500 text-xs">{e.tecnico}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${e.status_faturamento === 'Faturado' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                              {e.status_faturamento || 'Pendente'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
