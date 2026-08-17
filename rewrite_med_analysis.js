import fs from 'fs';

const content = `import React, { useMemo, useState } from 'react';
import { Visit, Integrado, GrowthCurvePoint } from '../types';
import { getActiveCurve } from '../data';
import { TrendingUp, Syringe, AlertCircle, Search, Pill, Calendar } from 'lucide-react';
import { format, subDays, subMonths, subYears, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

interface Props {
  visits: Visit[];
  integrados: Integrado[];
}

interface EnrichedTreatment {
  id: string;
  visitDate: string;
  produto: string;
  motivo: string;
  doseMgKg: number;
  concentracao: number;
  duracaoDias: number;
  
  animaisTratados: number;
  pesoEstimadoKg: number;
  mgTotalTratamento: number;
  produtoConsumidoKg: number;

  loteId: string;
  integradoNome: string;
}

export function MedicationAnalysis({ visits, integrados }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [period, setPeriod] = useState('6m');

  const allTreatmentData = useMemo(() => {
    const data: EnrichedTreatment[] = [];

    visits.forEach(visit => {
      if (!visit.tratamentos || visit.tratamentos.length === 0) return;

      const integrado = integrados.find(i => i.id === visit.integradoId);
      if (!integrado) return;

      let pesoEstimadoKg = visit.pesoAmostradoKg || 0;
      if (pesoEstimadoKg <= 0) {
        const { curve } = getActiveCurve(integrado.alojamentoDate || visit.date, 'Em andamento', visit.tipoLote || 'Misto');
        const expectedPoint = curve.find((p: GrowthCurvePoint) => p.dia >= (visit.idade || 0));
        pesoEstimadoKg = expectedPoint ? expectedPoint.pesoInicial : 0;
      }

      const animaisTratados = Math.max(0, (visit.animaisAlojados || 0) - (visit.animaisMortos || 0));

      visit.tratamentos.forEach(t => {
        if (!t.produto) return;
        
        const concentracao = t.concentracao && t.concentracao > 0 ? t.concentracao : 100;
        const duracaoDias = t.duracaoDias || 1;
        const doseMgKg = t.doseMgKg || 0;

        const mgTotalTratamento = animaisTratados * pesoEstimadoKg * doseMgKg * duracaoDias;
        const produtoConsumidoKg = (mgTotalTratamento / 1000000) / (concentracao / 100);

        data.push({
          id: t.id,
          visitDate: visit.date,
          produto: t.produto,
          motivo: t.motivo || 'Não informado',
          doseMgKg,
          concentracao,
          duracaoDias,
          animaisTratados,
          pesoEstimadoKg,
          mgTotalTratamento,
          produtoConsumidoKg,
          loteId: visit.integradoId,
          integradoNome: integrado.name
        });
      });
    });

    return data.sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());
  }, [visits, integrados]);

  // Apply Period Filter
  const periodFilteredData = useMemo(() => {
    if (period === 'all') return allTreatmentData;
    
    const now = new Date();
    let cutoff = new Date();
    if (period === '30d') cutoff = subDays(now, 30);
    else if (period === '90d') cutoff = subDays(now, 90);
    else if (period === '6m') cutoff = subMonths(now, 6);
    else if (period === '1y') cutoff = subYears(now, 1);

    return allTreatmentData.filter(t => new Date(t.visitDate) >= cutoff);
  }, [allTreatmentData, period]);

  // Chart Data
  const chartData = useMemo(() => {
    const grouped = periodFilteredData.reduce((acc, t) => {
      const dateObj = new Date(t.visitDate);
      const key = format(dateObj, 'yyyy-MM');
      const label = format(dateObj, 'MMM/yy', { locale: ptBR });
      
      if (!acc[key]) {
        acc[key] = { key, label, kg: 0 };
      }
      acc[key].kg += t.produtoConsumidoKg;
      return acc;
    }, {} as Record<string, { key: string, label: string, kg: number }>);

    return Object.values(grouped)
      .sort((a, b) => a.key.localeCompare(b.key))
      .map(item => ({
        name: item.label,
        kg: Number(item.kg.toFixed(1))
      }));
  }, [periodFilteredData]);

  // Aggregations
  const totalKg = periodFilteredData.reduce((acc, t) => acc + t.produtoConsumidoKg, 0);

  const byProduct = periodFilteredData.reduce((acc, t) => {
    acc[t.produto] = (acc[t.produto] || 0) + t.produtoConsumidoKg;
    return acc;
  }, {} as Record<string, number>);
  const sortedProducts = Object.entries(byProduct).sort((a, b) => b[1] - a[1]);

  const byMotivo = periodFilteredData.reduce((acc, t) => {
    acc[t.motivo] = (acc[t.motivo] || 0) + t.produtoConsumidoKg;
    return acc;
  }, {} as Record<string, number>);
  const sortedMotivos = Object.entries(byMotivo).sort((a, b) => b[1] - a[1]);

  const byIntegrado = periodFilteredData.reduce((acc, t) => {
    if (!acc[t.integradoNome]) {
      acc[t.integradoNome] = { kg: 0, animais: t.animaisTratados };
    }
    acc[t.integradoNome].kg += t.produtoConsumidoKg;
    if (t.animaisTratados > acc[t.integradoNome].animais) {
      acc[t.integradoNome].animais = t.animaisTratados;
    }
    return acc;
  }, {} as Record<string, { kg: number, animais: number }>);
  
  const sortedIntegrados = Object.entries(byIntegrado)
    .map(([nome, data]) => ({
       nome, 
       kg: data.kg, 
       kgPer1000: data.animais > 0 ? (data.kg / data.animais) * 1000 : 0 
    }))
    .sort((a, b) => b.kgPer1000 - a.kgPer1000);

  const filteredData = periodFilteredData.filter(t => 
    t.produto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.integradoNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.motivo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-1">
            <Pill className="w-5 h-5 text-indigo-600" />
            Consumo de Medicamentos
          </h2>
          <p className="text-sm text-slate-500">
            Acompanhe a evolução do consumo total (em kg) de produtos utilizados na medicação dos lotes.
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-1">
          <Calendar className="w-4 h-4 text-slate-400 ml-2" />
          <select 
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-transparent text-sm font-medium text-slate-700 py-1.5 pr-8 pl-2 outline-none border-none focus:ring-0 cursor-pointer"
          >
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="6m">Últimos 6 meses</option>
            <option value="1y">Último ano</option>
            <option value="all">Todo o período</option>
          </select>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center">
          <div className="text-sm text-slate-500 mb-1">Total Consumido no Período</div>
          <div className="text-3xl font-black text-slate-800">
            {totalKg.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} <span className="text-base font-medium text-slate-500">kg</span>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center">
          <div className="text-sm text-slate-500 mb-1">Produto Mais Utilizado</div>
          <div className="text-lg font-bold text-slate-800 truncate">
            {sortedProducts[0] ? sortedProducts[0][0] : 'Nenhum'}
          </div>
          <div className="text-sm font-medium text-indigo-600">
            {sortedProducts[0] ? sortedProducts[0][1].toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' kg' : '-'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center">
          <div className="text-sm text-slate-500 mb-1">Principal Motivo</div>
          <div className="text-lg font-bold text-slate-800 truncate">
            {sortedMotivos[0] ? sortedMotivos[0][0] : 'Nenhum'}
          </div>
          <div className="text-sm font-medium text-rose-600">
            {sortedMotivos[0] ? sortedMotivos[0][1].toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' kg' : '-'}
          </div>
        </div>
      </div>

      {/* Gráfico de Evolução */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Evolução do Consumo</h3>
        <div className="h-64 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <RechartsTooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [\`\${value.toLocaleString('pt-BR')} kg\`, 'Consumo']}
                />
                <Bar dataKey="kg" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
              Sem dados de consumo para o período selecionado.
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Motivos */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Consumo por Motivo</h3>
          <div className="space-y-3">
            {sortedMotivos.slice(0, 5).map(([motivo, kg]) => (
              <div key={motivo}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700">{motivo}</span>
                  <span className="font-bold text-slate-900">{kg.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div 
                    className="bg-indigo-500 h-2 rounded-full" 
                    style={{ width: \`\${Math.min(100, (kg / totalKg) * 100)}%\` }}
                  ></div>
                </div>
              </div>
            ))}
            {sortedMotivos.length === 0 && <div className="text-sm text-slate-500 text-center py-4">Sem dados suficientes</div>}
          </div>
        </div>

        {/* Top Integrados (Consumo Relativo) */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider flex items-center justify-between">
            Ranking Lotes 
            <span className="text-xs font-normal text-slate-500 normal-case bg-slate-100 px-2 py-0.5 rounded">kg / 1.000 cabeças</span>
          </h3>
          <div className="space-y-3">
            {sortedIntegrados.slice(0, 5).map((item, index) => (
              <div key={item.nome} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{item.nome}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-rose-600">{item.kgPer1000.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg</div>
                  <div className="text-xs text-slate-400">Total: {item.kg.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg</div>
                </div>
              </div>
            ))}
            {sortedIntegrados.length === 0 && <div className="text-sm text-slate-500 text-center py-4">Sem dados suficientes</div>}
          </div>
        </div>
      </div>

      {/* Histórico Detalhado */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Histórico de Aplicações</h3>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="p-3 text-xs font-semibold text-slate-500 uppercase">Data</th>
                <th className="p-3 text-xs font-semibold text-slate-500 uppercase">Lote</th>
                <th className="p-3 text-xs font-semibold text-slate-500 uppercase">Produto / Motivo</th>
                <th className="p-3 text-xs font-semibold text-slate-500 uppercase text-right">Massa Corp. (kg)</th>
                <th className="p-3 text-xs font-semibold text-slate-500 uppercase text-right">Consumo (kg)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.slice(0, 50).map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-3 text-sm text-slate-700 whitespace-nowrap">
                    {format(new Date(t.visitDate), "dd/MMM", { locale: ptBR })}
                  </td>
                  <td className="p-3 text-sm text-slate-800 font-medium whitespace-nowrap">
                    {t.integradoNome}
                  </td>
                  <td className="p-3 text-sm">
                    <div className="font-medium text-slate-800">{t.produto}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      {t.motivo} &bull; {t.concentracao}% conc.
                    </div>
                  </td>
                  <td className="p-3 text-sm text-slate-700 text-right">
                    <div>{(t.animaisTratados * t.pesoEstimadoKg).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</div>
                    <div className="text-xs text-slate-400">{t.animaisTratados} cab. x {t.pesoEstimadoKg.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg</div>
                  </td>
                  <td className="p-3 text-right">
                    <div className="text-sm font-bold text-indigo-600">
                      {t.produtoConsumidoKg.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xs">kg</span>
                    </div>
                    <div className="text-xs text-slate-400">
                      {t.doseMgKg} mg/kg x {t.duracaoDias} dias
                    </div>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 text-sm">
                    Nenhum tratamento encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/components/MedicationAnalysis.tsx', content);
