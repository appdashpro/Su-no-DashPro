import { safeStorage } from "../lib/safeStorage";
import { getEmpresaConfigsLocal } from "../lib/storage";
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { 
 ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
 BarChart, Bar, Cell, ReferenceArea, LabelList
} from 'recharts';
import { Visit, Integrado, isVisitForIntegrado } from '../types';
import { getExpectedConsumption, getActiveCurve } from '../data';
import { 
  calculateRealConsumption, 
  calculateVisitAge, 
  calculateMortalityRate,
  calculateVisitFeedDeviation 
} from '../utils/cargill-calculations';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { FileDown, Filter, Calendar, Download, TrendingUp, TrendingDown, AlertTriangle, ArrowUpDown, ChevronDown, Check, X } from 'lucide-react';

interface DashboardProps {
 visits: Visit[];
 integrados: Integrado[];
 onNavigateToVisit?: (visitId: string) => void;
}

export function Dashboard({ visits, integrados, onNavigateToVisit }: DashboardProps) {
  const configs = getEmpresaConfigsLocal();
 const [selectedIntegradoIds, setSelectedIntegradoIds] = useState<string[]>(() => {
 const saved = safeStorage.getItem('DASHBOARD_SELECTED_INTEGRADOS');
 if (saved) {
 try { const parsed = JSON.parse(saved); if (Array.isArray(parsed)) return parsed; } catch (e) {}
 }
 return [];
 });
 const [isDropdownOpen, setIsDropdownOpen] = useState(false);
 const [isExporting, setIsExporting] = useState(false);
 const [activeKpiModal, setActiveKpiModal] = useState<'total' | 'alertas' | 'desvio' | 'mortalidade' | null>(null);
 const dropdownRef = useRef<HTMLDivElement>(null);
 const dashboardRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
 const handleClickOutside = (event: MouseEvent) => {
 if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
 setIsDropdownOpen(false);
 }
 };
 document.addEventListener('mousedown', handleClickOutside);
 
 const handleSelectLote = (event: any) => {
 const loteId = event.detail;
 setSelectedIntegradoIds([loteId]);
 safeStorage.setItem('DASHBOARD_SELECTED_INTEGRADOS', JSON.stringify([loteId]));
 };
 window.addEventListener('dashboard:select-lote', handleSelectLote);
 
 return () => {
 document.removeEventListener('mousedown', handleClickOutside);
 window.removeEventListener('dashboard:select-lote', handleSelectLote);
 };
 }, []);

 const [selectedPeriod, setSelectedPeriod] = useState<string>(() => {
 return safeStorage.getItem('DASHBOARD_SELECTED_PERIOD') || 'all';
 });
 const [sortBy, setSortBy] = useState<string>(() => {
 return safeStorage.getItem('DASHBOARD_SORT_BY') || 'name-asc';
 });
 const [windowWidth, setWindowWidth] = useState(window.innerWidth);

 useEffect(() => {
 safeStorage.setItem('DASHBOARD_SELECTED_INTEGRADOS', JSON.stringify(selectedIntegradoIds));
 }, [selectedIntegradoIds]);

 useEffect(() => {
 safeStorage.setItem('DASHBOARD_SELECTED_PERIOD', selectedPeriod);
 }, [selectedPeriod]);

 useEffect(() => {
 safeStorage.setItem('DASHBOARD_SORT_BY', sortBy);
 }, [sortBy]);

 useEffect(() => {
 const handleResize = () => setWindowWidth(window.innerWidth);
 window.addEventListener('resize', handleResize);
 return () => window.removeEventListener('resize', handleResize);
 }, []);

 const dotRadius = windowWidth >= 1024 ? 6 : 3;
 const activeDotRadius = windowWidth >= 1024 ? 9 : 5;

 // Process active integrados only based on status
 const [currentConfig, setCurrentConfig] = useState<any>(null);

  const activeIntegrados = useMemo(() => {
 return integrados.filter(i => i.status === 'Em andamento');
 }, [integrados]);

 const filteredIntegrados = useMemo(() => {
 if (selectedIntegradoIds.length === 0) return activeIntegrados;
 return activeIntegrados.filter(i => selectedIntegradoIds.includes(i.id));
 }, [activeIntegrados, selectedIntegradoIds]);

 // Filter visits based on selected period
 const filteredVisits = useMemo(() => {
 let filtered = visits;
 
 if (selectedPeriod !== 'all') {
 const now = new Date();
 now.setHours(23, 59, 59, 999);
 
 filtered = visits.filter(v => {
 const visitDate = new Date(v.date);
 
 if (selectedPeriod === '7d') {
 const sevenDaysAgo = new Date();
 sevenDaysAgo.setDate(now.getDate() - 7);
 return visitDate >= sevenDaysAgo && visitDate <= now;
 }
 
 if (selectedPeriod === '30d') {
 const thirtyDaysAgo = new Date();
 thirtyDaysAgo.setDate(now.getDate() - 30);
 return visitDate >= thirtyDaysAgo && visitDate <= now;
 }

 if (selectedPeriod === 'this_month') {
 return visitDate.getMonth() === now.getMonth() && visitDate.getFullYear() === now.getFullYear();
 }

 if (selectedPeriod === 'last_month') {
 const lastMonth = new Date(now);
 lastMonth.setMonth(now.getMonth() - 1);
 return visitDate.getMonth() === lastMonth.getMonth() && visitDate.getFullYear() === lastMonth.getFullYear();
 }
 
 return true;
 });
 }

 return filtered.filter(v => filteredIntegrados.some(i => isVisitForIntegrado(v, i)));
 }, [visits, filteredIntegrados, selectedPeriod]);

  // Process data for charts
  const chartData = useMemo(() => {
    let avgPesoAloj: number | undefined = undefined;
    let dominantTipoLote: 'Misto' | 'Fêmea' | 'Macho' | undefined = undefined;
    let singleAlojamentoDate: string | undefined = undefined;
    let singleStatus: string | undefined = undefined;
    let singleFechamentoDate: string | undefined = undefined;

    if (filteredIntegrados.length === 1) {
      const single = filteredIntegrados[0];
      singleAlojamentoDate = single.alojamentoDate;
      singleStatus = single.status;
      singleFechamentoDate = single.fechamentoDate;
    }

    if (filteredVisits.length > 0) {
      let totalPeso = 0;
      let countPeso = 0;
      const tiposCount = { 'Misto': 0, 'Fêmea': 0, 'Macho': 0 };
      
      const uniqueIntegrados = new Set();
      // Calculate averages from the latest state of each lot in the filtered set
      [...filteredVisits].sort((a, b) => {
        const matchedA = filteredIntegrados.find(i => isVisitForIntegrado(a, i));
        const matchedB = filteredIntegrados.find(i => isVisitForIntegrado(b, i));
        return calculateVisitAge(b, matchedB) - calculateVisitAge(a, matchedA);
      }).forEach(v => {
        const matched = filteredIntegrados.find(i => isVisitForIntegrado(v, i));
        const key = matched ? matched.id : v.integradoId;
        if (!uniqueIntegrados.has(key)) {
          uniqueIntegrados.add(key);
          if (v.pesoAloj) {
            totalPeso += Number(v.pesoAloj);
            countPeso++;
          }
          if (v.tipoLote) {
            tiposCount[v.tipoLote as keyof typeof tiposCount] = (tiposCount[v.tipoLote as keyof typeof tiposCount] || 0) + 1;
          }
        }
      });
      
      if (countPeso > 0) {
        avgPesoAloj = totalPeso / countPeso;
      }
      
      let maxCount = -1;
      Object.entries(tiposCount).forEach(([tipo, count]) => {
        if (count > maxCount) {
          maxCount = count;
          dominantTipoLote = tipo as any;
        }
      });
    }

    // Generates points for the expected curve (from 1 to 100 days)
    const ages = new Set<number>();
    for (let i = 1; i <= 100; i++) {
      ages.add(i);
    }

    filteredVisits.forEach(v => {
      const matched = filteredIntegrados.find(i => isVisitForIntegrado(v, i));
      const idade = calculateVisitAge(v, matched);
      if (idade > 0) {
        ages.add(idade);
      }
    });

    const sortedAges = Array.from(ages).sort((a, b) => a - b);

    return sortedAges.map(idade => {
      const visitsAtAge = filteredVisits.filter(v => {
        const matched = filteredIntegrados.find(i => isVisitForIntegrado(v, i));
        return calculateVisitAge(v, matched) === idade;
      });
      
      // Calculate expected consumption using reactive Cargill curve utilities
      const sampleVisit = visitsAtAge[0];
      const expected = getExpectedConsumption(
        idade, 
        dominantTipoLote, 
        avgPesoAloj, 
        singleAlojamentoDate, 
        singleStatus, 
        singleFechamentoDate,
        undefined,
        undefined,
        sampleVisit?.date
      );
      
      const dataPoint: any = {
        idade,
        consumoEsperado: expected,
        consumoEsperadoRange: [Math.max(0, expected - 5), expected + 5]
      };
      
      visitsAtAge.forEach(v => {
        const matched = filteredIntegrados.find(i => isVisitForIntegrado(v, i));
        const key = matched ? matched.id : v.integradoId;
        const realConsumo = calculateRealConsumption(v);
        if (realConsumo > 0) {
          if (!dataPoint[key] || realConsumo > dataPoint[key]) {
            dataPoint[key] = realConsumo;
          }
        }
      });

      return dataPoint;
    });
  }, [filteredVisits, filteredIntegrados]);

  // Data specifically for the Bar Chart (Latest visit per Integrado)
  const latestVisitsData = useMemo(() => {
    const latestVisitsMap = new Map<string, { visit: Visit; age: number; realConsumo: number }>();
    filteredVisits.forEach(v => {
      const matched = filteredIntegrados.find(i => isVisitForIntegrado(v, i));
      const key = matched ? matched.id : v.integradoId;
      const age = calculateVisitAge(v, matched);
      const realConsumo = calculateRealConsumption(v);

      const existing = latestVisitsMap.get(key);
      if (!existing) {
        latestVisitsMap.set(key, { visit: v, age, realConsumo });
      } else {
        if (realConsumo > existing.realConsumo) {
          latestVisitsMap.set(key, { visit: v, age, realConsumo });
        } else if (realConsumo === existing.realConsumo) {
          if (new Date(v.date).getTime() >= new Date(existing.visit.date).getTime()) {
            latestVisitsMap.set(key, { visit: v, age, realConsumo });
          }
        }
      }
    });

    return Array.from(latestVisitsMap.values())
      .filter(({ realConsumo }) => realConsumo > 0)
      .map(({ visit: v, age, realConsumo }) => {
        const integrado = filteredIntegrados.find(i => isVisitForIntegrado(v, i));
        
        const expected = getExpectedConsumption(
          age,
          v.tipoLote,
          v.pesoAloj,
          integrado?.alojamentoDate,
          integrado?.status,
          integrado?.fechamentoDate,
          undefined,
          undefined,
          v.date
        );
        
        const mortPct = calculateMortalityRate(v);

        const abbreviateName = (name?: string) => {
          if (!name) return 'Desconhecido';
          const parts = name.trim().split(' ');
          if (parts.length > 1) {
            return `${parts[0]} ${parts[parts.length - 1][0]}.`;
          }
          return name;
        };

        return {
          id: v.id,
          integradoId: v.integradoId,
          name: integrado ? abbreviateName(integrado.name) : 'Desconhecido',
          fullName: integrado?.name || 'Desconhecido',
          tipoLote: v.tipoLote || 'Misto',
          date: v.date,
          idade: age,
          consumoReal: realConsumo,
          consumoEsperado: expected,
          diferenca: Number((realConsumo - expected).toFixed(2)),
          mortalidade: mortPct,
          animaisMortos: v.animaisMortos,
          animaisAlojados: v.animaisAlojados,
        };
      }).sort((a, b) => {
        switch (sortBy) {
          case 'name-desc':
            return b.name.localeCompare(a.name);
          case 'diferenca-desc':
            return b.diferenca - a.diferenca;
          case 'diferenca-asc':
            return a.diferenca - b.diferenca;
          case 'idade-desc':
            return b.idade - a.idade;
          case 'idade-asc':
            return a.idade - b.idade;
          case 'name-asc':
          default:
            return a.name.localeCompare(b.name);
        }
      });
  }, [filteredVisits, filteredIntegrados, sortBy]);

  const stats = useMemo(() => {
    const totalIntegrados = filteredIntegrados.length;
    // Count alerts only on latest visits
    const alertCount = latestVisitsData.filter(d => d.diferenca < -5 || d.diferenca > 5).length;
    const avgMortalidade = (() => {
      let totalMortos = 0;
      let totalAlojados = 0;
      let sumPercentages = 0;
      let countPercentages = 0;

      latestVisitsData.forEach(d => {
        const mortos = d.animaisMortos !== undefined && d.animaisMortos !== null ? Number(d.animaisMortos) : (d.mortalidade !== undefined && Number(d.animaisAlojados || 0) > 0 ? (Number(d.mortalidade) / 100) * Number(d.animaisAlojados || 0) : 0);
        const alojados = Number(d.animaisAlojados || 0);
        
        if (alojados > 0) {
          totalMortos += mortos;
          totalAlojados += alojados;
        } else if (d.mortalidade !== undefined && d.mortalidade !== null) {
          sumPercentages += Number(d.mortalidade);
          countPercentages++;
        }
      });
      
      if (totalAlojados > 0) {
        return (totalMortos / totalAlojados) * 100;
      } else if (countPercentages > 0) {
        return sumPercentages / countPercentages;
      }
      return 0;
    })();
    const avgDiferenca = latestVisitsData.length > 0
      ? latestVisitsData.reduce((acc, curr) => acc + curr.diferenca, 0) / latestVisitsData.length
      : 0;
    
    return { totalIntegrados, alertCount, avgMortalidade, avgDiferenca };
  }, [latestVisitsData, filteredIntegrados.length]);
 const handleExportPDF = async () => {
 if (!dashboardRef.current) return;
 setIsExporting(true);
 
 // Give time for state to update and re-render
 setTimeout(async () => {
 try {
 const canvas = await html2canvas(dashboardRef.current as HTMLElement, { scale: 2, useCORS: true, logging: false, windowWidth: 1200 });
 const imgData = canvas.toDataURL('image/jpeg', 0.98);
 
 const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
 const pdfWidth = pdf.internal.pageSize.getWidth();
 const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
 
 let position = 0;
 let heightLeft = pdfHeight;
 const pageHeight = pdf.internal.pageSize.getHeight();
 
 pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
 heightLeft -= pageHeight;
 
 while (heightLeft >= 0) {
 position = heightLeft - pdfHeight;
 pdf.addPage();
 pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
 heightLeft -= pageHeight;
 }
 const filename = selectedIntegradoIds.length === 1 ? `relatorio_${filteredIntegrados[0]?.name || 'lote'}.pdf` : 'relatorio_dashboard.pdf';
 pdf.save(filename);
 } catch (e) {
 console.error('Failed to export PDF:', e);
 alert('Erro ao exportar PDF. Tente novamente.');
 } finally {
 setIsExporting(false);
 }
 }, 300);
 };


 

 return (
 <div className="space-y-4" ref={dashboardRef}>
 {!isExporting && (
 <div className="flex flex-col md:flex-row justify-end items-start md:items-center gap-3">
 <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
 {selectedIntegradoIds.length === 1 && (
 <button
 onClick={handleExportPDF}
 className="flex items-center justify-center gap-2 text-sm text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg shadow-sm w-full md:w-auto font-medium transition-colors"
 >
 <FileDown className="w-4 h-4" />
 Gerar PDF
 </button>
 )}
 
 
 <div className="flex items-center gap-2 text-sm text-slate-500 bg-white border border-slate-200 px-3 py-2 rounded-lg shadow-sm w-full md:w-auto">

 <ArrowUpDown className="w-4 h-4" />
 <select 
 value={sortBy}
 onChange={(e) => setSortBy(e.target.value)}
 className="bg-transparent outline-none cursor-pointer text-slate-700 font-medium w-full"
 >
 <option value="name-asc">Nome (A-Z)</option>
 <option value="name-desc">Nome (Z-A)</option>
 <option value="diferenca-asc">Desvio (Menor p/ Maior)</option>
 <option value="diferenca-desc">Desvio (Maior p/ Menor)</option>
 <option value="idade-desc">Idade (Maior)</option>
 <option value="idade-asc">Idade (Menor)</option>
 </select>
 </div>
 <div className="relative w-full md:w-48">
 <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
 <select
 value={selectedPeriod}
 onChange={(e) => setSelectedPeriod(e.target.value)}
 className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-slate-700 font-medium shadow-sm"
 >
 <option value="all">Todo o Período</option>
 <option value="7d">Últimos 7 dias</option>
 <option value="30d">Últimos 30 dias</option>
 <option value="this_month">Este mês</option>
 <option value="last_month">Mês passado</option>
 </select>
 </div>
 
 <div className="relative w-full md:w-64" ref={dropdownRef}>
 <button
 onClick={() => setIsDropdownOpen(!isDropdownOpen)}
 className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium shadow-sm flex items-center justify-between"
 >
 <div className="flex items-center gap-2 overflow-hidden">
 <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
 <span className="truncate ml-2">
 {selectedIntegradoIds.length === 0 
 ? 'Todos os Produtores' 
 : `${selectedIntegradoIds.length} selecionado(s)`}
 </span>
 </div>
 <ChevronDown className="w-4 h-4 text-slate-400" />
 </button>
 
 {isDropdownOpen && (
 <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
 <div 
 className="flex items-center px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100"
 onClick={() => setSelectedIntegradoIds([])}
 >
 <div className={`w-4 h-4 border rounded mr-2 flex items-center justify-center ${selectedIntegradoIds.length === 0 ? 'bg-blue-500 border-blue-500' : 'border-slate-300'}`}>
 {selectedIntegradoIds.length === 0 && <Check className="w-3 h-3 text-white" />}
 </div>
 <span className="text-sm text-slate-700 font-medium">Todos os Produtores</span>
 </div>
 {activeIntegrados.map(i => {
 const isSelected = selectedIntegradoIds.includes(i.id);
 return (
 <div 
 key={i.id}
 className="flex items-center px-3 py-2 hover:bg-slate-50 cursor-pointer"
 onClick={() => {
 setSelectedIntegradoIds(prev => 
 isSelected 
 ? prev.filter(id => id !== i.id)
 : [...prev, i.id]
 );
 }}
 >
 <div className={`w-4 h-4 border rounded mr-2 flex items-center justify-center shrink-0 ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-slate-300'}`}>
 {isSelected && <Check className="w-3 h-3 text-white" />}
 </div>
 <span className="text-sm text-slate-700 truncate">{i.name} {i.alojamentoDate ? `(${i.alojamentoDate.split('-').reverse().join('/')})` : ''}</span>
 </div>
 );
 })}
 </div>
 )}
 </div>
 </div>
 </div>

 )}
 {/* KPI Cards */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
 <div 
 id="kpi-total" onClick={() => setActiveKpiModal('total')}
 className="bg-white border border-slate-200 rounded-md py-2 px-3 shadow-sm flex flex-col justify-between cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group relative overflow-hidden"
 >
 <div className="absolute top-0 right-0 w-10 h-10 bg-slate-100 rounded-bl-[30px] z-0 transition-transform group-hover:scale-110"></div>
 <div className="relative z-10">
 <div className="flex justify-between items-start mb-1">
 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total de Lotes</p>
 <div className="text-slate-300 group-hover:text-blue-500 transition-colors">
 <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
 </div>
 </div>
 <p className="text-lg font-bold text-slate-800 mt-0.5">{stats.totalIntegrados}</p>
 </div>
 <p className="text-[10px] text-blue-600 font-medium mt-1 relative z-10">Lotes em andamento</p>
 </div>

 <div 
 id="kpi-alertas" onClick={() => stats.alertCount > 0 && setActiveKpiModal('alertas')}
 className={`bg-white border border-slate-200 rounded-md py-2 px-3 shadow-sm flex flex-col justify-between ${stats.alertCount > 0 ? 'cursor-pointer hover:border-amber-300 hover:shadow-md transition-all group' : 'opacity-80'} relative overflow-hidden`}
 >
 {stats.alertCount > 0 && <div className="absolute top-0 right-0 w-10 h-10 bg-amber-50 rounded-bl-[30px] z-0 transition-transform group-hover:scale-110"></div>}
 <div className="relative z-10">
 <div className="flex justify-between items-start mb-1">
 <div className="flex items-center gap-2">
 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Alertas</p>
 {stats.alertCount > 0 && <AlertTriangle className="w-2.5 h-2.5 text-amber-500" />}
 </div>
 {stats.alertCount > 0 && (
 <div className="text-slate-300 group-hover:text-amber-500 transition-colors">
 <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
 </div>
 )}
 </div>
 <p className="text-lg font-bold text-slate-800 mt-0.5">{stats.alertCount}</p>
 </div>
 <p className="text-[10px] text-slate-500 font-medium mt-1 relative z-10">Desvios &gt; 5kg na última visita</p>
 </div>

 <div 
 id="kpi-desvio" onClick={() => setActiveKpiModal('desvio')}
 className="bg-white border border-slate-200 rounded-md py-2 px-3 shadow-sm flex flex-col justify-between cursor-pointer hover:border-emerald-300 hover:shadow-md transition-all group relative overflow-hidden"
 >
 <div className="absolute top-0 right-0 w-10 h-10 bg-slate-50 rounded-bl-[30px] z-0 transition-transform group-hover:scale-110"></div>
 <div className="relative z-10">
 <div className="flex justify-between items-start mb-1">
 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Desvio Médio Geral</p>
 <div className="text-slate-300 group-hover:text-emerald-500 transition-colors">
 <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
 </div>
 </div>
 <p className={`text-lg font-bold flex items-center gap-1 mt-0.5 ${stats.avgDiferenca > 0 ? 'text-blue-600' : stats.avgDiferenca < 0 ? 'text-red-500' : 'text-slate-800'}`}>
 {stats.avgDiferenca > 0 ? <TrendingUp className="w-4 h-4" /> : stats.avgDiferenca < 0 ? <TrendingDown className="w-4 h-4" /> : null}
 {stats.avgDiferenca > 0 ? '+' : ''}{stats.avgDiferenca.toFixed(2)} kg
 </p>
 </div>
 <p className="text-[10px] text-slate-500 font-medium mt-1 relative z-10">Em relação à curva alvo</p>
 </div>

 <div 
 id="kpi-mortalidade" onClick={() => setActiveKpiModal('mortalidade')}
 className="bg-blue-600 rounded-md py-2 px-3 shadow-lg text-white flex flex-col justify-between cursor-pointer hover:bg-blue-700 transition-all group relative overflow-hidden"
 >
 <div className="absolute top-0 right-0 w-10 h-10 bg-blue-500 opacity-50 rounded-bl-[30px] z-0 transition-transform group-hover:scale-110"></div>
 <div className="relative z-10">
 <div className="flex justify-between items-start mb-1">
 <p className="text-[10px] font-bold text-blue-100 uppercase tracking-wide">Mortalidade Média</p>
 <div className="text-blue-300 group-hover:text-white transition-colors">
 <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
 </div>
 </div>
 <p className="text-lg font-bold mt-0.5">{stats.avgMortalidade.toFixed(2)}%</p>
 </div>
 <p className="text-[10px] text-blue-200 font-medium mt-1 relative z-10">
    {currentConfig?.meta_mortalidade ? `Meta configurada: ${currentConfig.meta_mortalidade}%` : 'Média dos lotes em andamento'}
  </p>
 </div>
 </div>

 {activeKpiModal && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setActiveKpiModal(null); }}>
 <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-in fade-in zoom-in duration-200">
 <div className="flex items-center justify-between p-4 border-b border-slate-100">
 <h3 className="text-lg font-bold text-slate-800">
 {activeKpiModal === 'total' && 'Todos os Lotes em Andamento'}
 {activeKpiModal === 'alertas' && 'Lotes com Alertas de Consumo (>5kg desvio)'}
 {activeKpiModal === 'desvio' && 'Impacto no Desvio de Consumo'}
 {activeKpiModal === 'mortalidade' && 'Impacto na Mortalidade'}
 </h3>
 <button onClick={() => setActiveKpiModal(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
 <X className="w-5 h-5" />
 </button>
 </div>
 <div className="p-4 overflow-y-auto">
 <table className="w-full text-sm text-left">
 <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0">
 <tr>
 <th className="px-4 py-3 font-semibold">Lote</th>
 <th className="px-4 py-3 font-semibold text-center">Idade</th>
 {activeKpiModal === 'mortalidade' ? (
 <th className="px-4 py-3 font-semibold text-right">Mortalidade</th>
 ) : (
 <th className="px-4 py-3 font-semibold text-right">Desvio (kg)</th>
 )}
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {(() => {
 let sortedData = [...latestVisitsData];
 
 if (activeKpiModal === 'alertas') {
 sortedData = sortedData.filter(d => Math.abs(d.diferenca) > 5).sort((a, b) => Math.abs(b.diferenca) - Math.abs(a.diferenca));
 } else if (activeKpiModal === 'desvio') {
 sortedData = sortedData.sort((a, b) => Math.abs(b.diferenca) - Math.abs(a.diferenca));
 } else if (activeKpiModal === 'mortalidade') {
 sortedData = sortedData.sort((a, b) => {
 const mA = a.animaisMortos !== undefined ? (Number(a.animaisMortos) / Number(a.animaisAlojados)) * 100 : Number(a.mortalidade || 0);
 const mB = b.animaisMortos !== undefined ? (Number(b.animaisMortos) / Number(b.animaisAlojados)) * 100 : Number(b.mortalidade || 0);
 return mB - mA;
 });
 }
 
 return sortedData.map((row) => {
 const mVal = row.animaisMortos !== undefined ? (Number(row.animaisMortos) / Number(row.animaisAlojados)) * 100 : Number(row.mortalidade || 0);
 return (
 <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
 <td 
 className={`px-4 py-3 font-medium whitespace-nowrap ${onNavigateToVisit ? 'text-blue-600 hover:text-blue-800 cursor-pointer underline' : 'text-slate-800'}`}
 onClick={() => {
 setActiveKpiModal(null);
 if (onNavigateToVisit) onNavigateToVisit(row.id);
 }}
 >
 {row.name}
 </td>
 <td className="px-4 py-3 text-slate-600 text-center">{row.idade} d</td>
 <td className="px-4 py-3 text-right font-medium">
 {activeKpiModal === 'mortalidade' ? (
 <span className={`${mVal > 3 ? 'text-red-600' : 'text-slate-700'}`}>
 {mVal.toFixed(2)}%
 </span>
 ) : (
 <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
 Math.abs(row.diferenca) <= 5 ? 'bg-blue-100 text-blue-700' : row.diferenca < -5 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
 }`}>
 {row.diferenca > 0 ? '+' : ''}{row.diferenca.toFixed(2)} kg
 </span>
 )}
 </td>
 </tr>
 );
 });
 })()}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 )}

 {/* Charts */}
 <div className="flex flex-col gap-6">
 <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm h-[400px] lg:h-[500px] xl:h-[600px] min-w-0">
 <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Consumo Real vs Tabela (por Idade)</h2>
 <ResponsiveContainer width="100%" height="100%">
 <ComposedChart data={chartData} margin={{ top: 5, right: 20, bottom: 35, left: 0 }}>
 <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
 <XAxis dataKey="idade" type="number" domain={[1, 100]} tickCount={10} label={{ value: 'Idade (Dias)', position: 'insideBottom', offset: -15 }} stroke="#64748b" fontSize={12} />
 <YAxis label={{ value: 'Consumo (kg)', angle: -90, position: 'insideLeft' }} stroke="#64748b" fontSize={12} />
 
 {/* Fases de Ração */}
 {/* @ts-ignore */}
 <ReferenceArea x1={1} x2={14} fill="#f1f5f9" fillOpacity={0.5} label={{ value: 'Aloj', position: 'insideTop', fill: '#94a3b8', fontSize: 10, offset: 10 }} />
 {/* @ts-ignore */}
 <ReferenceArea x1={14} x2={32} fill="#e2e8f0" fillOpacity={0.5} label={{ value: 'C1', position: 'insideTop', fill: '#94a3b8', fontSize: 10, offset: 10 }} />
 {/* @ts-ignore */}
 <ReferenceArea x1={32} x2={46} fill="#cbd5e1" fillOpacity={0.5} label={{ value: 'C2', position: 'insideTop', fill: '#94a3b8', fontSize: 10, offset: 10 }} />
 {/* @ts-ignore */}
 <ReferenceArea x1={46} x2={64} fill="#f1f5f9" fillOpacity={0.5} label={{ value: 'C3', position: 'insideTop', fill: '#94a3b8', fontSize: 10, offset: 10 }} />
 {/* @ts-ignore */}
 <ReferenceArea x1={64} x2={74} fill="#e2e8f0" fillOpacity={0.5} label={{ value: 'T1', position: 'insideTop', fill: '#94a3b8', fontSize: 10, offset: 10 }} />
 {/* @ts-ignore */}
 <ReferenceArea x1={74} x2={96} fill="#cbd5e1" fillOpacity={0.5} label={{ value: 'T2', position: 'insideTop', fill: '#94a3b8', fontSize: 10, offset: 10 }} />

 <Tooltip cursor={{ stroke: '#cbd5e1' }} 
 contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
 labelFormatter={(label) => `Idade: ${label} dias`} 
 formatter={(value: any, name: any) => {
 if (Array.isArray(value)) {
 return [`${Number(value[0]).toFixed(2)} - ${Number(value[1]).toFixed(2)} kg`, name];
 }
 return [`${Number(value).toFixed(2)} kg`, name];
 }}
 />
 {filteredIntegrados.length <= 4 && (
 <Legend 
 verticalAlign="top" 
 height={36} 
 iconType="circle" 
 // @ts-ignore
 payload={[
 { value: 'Curva Alvo', type: 'circle', id: 'consumoEsperado', color: '#94a3b8' },
 ...Array.from(new Map(filteredIntegrados.map((integrado, index) => {
 const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e'];
 const abbreviateName = (name?: string) => {
 if (!name) return 'Desconhecido';
 const parts = name.trim().split(' ');
 if (parts.length > 1) {
 return `${parts[0]} ${parts[parts.length - 1][0]}.`;
 }
 return name;
 };
 const name = abbreviateName(integrado.name);
 return [name, {
 value: name,
 type: 'circle',
 id: integrado.id,
 color: colors[index % colors.length]
 }];
 })).values()) as any[]
 ] as any[]}
 />
 )}
 <Area type="monotone" dataKey="consumoEsperadoRange" name="Margem de Erro (±5kg)" stroke="none" fill="#cbd5e1" fillOpacity={0.3} activeDot={false} />
 <Line type="monotone" dataKey="consumoEsperado" name="Curva Alvo" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
 {filteredIntegrados.map((integrado, index) => {
 const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e'];
 
 const abbreviateName = (name?: string) => {
 if (!name) return 'Desconhecido';
 const parts = name.trim().split(' ');
 if (parts.length > 1) {
 return `${parts[0]} ${parts[parts.length - 1][0]}.`;
 }
 return name;
 };

 return (
 <Line 
 key={integrado.id} 
 type="monotone" 
 dataKey={integrado.id} 
 name={abbreviateName(integrado.name)} 
 stroke={colors[index % colors.length]} 
 strokeWidth={2} 
 dot={{ r: dotRadius }} 
 activeDot={{ r: activeDotRadius }} 
 connectNulls={true} 
 />
 );
 })}
 </ComposedChart>
 </ResponsiveContainer>
 </div>

 <div className="flex flex-col gap-6">
 <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm h-[400px] min-w-0">
 <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Desvio de Consumo por Lote (Última Visita)</h2>
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={latestVisitsData} margin={{ top: 5, right: 20, bottom: 50, left: 0 }}>
 <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
 <XAxis dataKey="name" stroke="#64748b" fontSize={11} angle={-45} textAnchor="end" />
 <YAxis stroke="#64748b" fontSize={12} />
 <Tooltip 
 cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }} 
 contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
 formatter={(value: any) => [`${value > 0 ? '+' : ''}${Number(value).toFixed(2)} kg`, 'Diferença']}
 />
 <Bar dataKey="diferenca" name="Diferença vs Alvo" radius={[4, 4, 0, 0]}>
 {
 latestVisitsData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={(Math.abs(entry.diferenca) <= 5) ? '#3b82f6' : entry.diferenca < -5 ? '#10b981' : '#ef4444'} />
 ))
 }
 <LabelList 
 dataKey="diferenca" 
 position="top" 
 fill="#64748b" 
 fontSize={10} 
 fontWeight={500}
 formatter={(val: any) => val > 0 ? `+${Number(val).toFixed(2)}` : Number(val).toFixed(2)}
 />
 </Bar>
 </BarChart>
 </ResponsiveContainer>
 </div>

 <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm h-[400px] flex flex-col min-w-0">
 <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Resumo da Última Visita (Tabela)</h2>
 <div className="flex-1 overflow-auto rounded-lg border border-slate-100">
 <table className="w-full text-sm text-left">
 <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0 z-10">
 <tr>
 <th className="px-4 py-3 font-semibold">Lote</th>
 <th className="px-4 py-3 font-semibold text-center">Idade</th>
 <th className="px-4 py-3 font-semibold text-right">Consumo Real</th>
 <th className="px-4 py-3 font-semibold text-right">Desvio</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {latestVisitsData.length > 0 ? (
 latestVisitsData.map((row) => (
 <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
 <td 
 className={`px-4 py-3 font-medium whitespace-nowrap ${onNavigateToVisit ? 'text-blue-600 hover:text-blue-800 cursor-pointer underline' : 'text-slate-800'}`}
 onClick={() => onNavigateToVisit && onNavigateToVisit(row.id)}
 title={onNavigateToVisit ? "Clique para ver detalhes do lote" : ""}
 >
 {row.name}
 <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500">
 {row.tipoLote}
 </span>
 </td>
 <td className="px-4 py-3 text-slate-600 text-center">{row.idade} d</td>
 <td className="px-4 py-3 text-slate-600 text-right font-medium">{row.consumoReal.toFixed(2)} kg</td>
 <td className="px-4 py-3 text-right">
 <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
 (Math.abs(row.diferenca) <= 5) ? 'bg-blue-100 text-blue-700' : row.diferenca < -5 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
 }`}>
 {row.diferenca > 0 ? '+' : ''}{row.diferenca.toFixed(2)} kg
 </span>
 </td>
 </tr>
 ))
 ) : (
 <tr>
 <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
 Nenhum dado encontrado para os filtros selecionados.
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 </div>
 
 

 {isExporting && selectedIntegradoIds.length === 1 && (
 <div className="mt-8 bg-white p-6 rounded-xl border border-slate-200" style={{ pageBreakInside: 'avoid' }}>
 <h2 className="text-xl font-bold text-slate-800 mb-4">Relatório Detalhado: {filteredIntegrados[0]?.name}</h2>
 
 <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
 <div>
 <p className="text-xs text-slate-500 font-medium">Data de Alojamento</p>
 <p className="text-sm font-semibold text-slate-800">{filteredIntegrados[0]?.alojamentoDate ? filteredIntegrados[0].alojamentoDate.split('-').reverse().join('/') : 'N/D'}</p>
 </div>
 <div>
 <p className="text-xs text-slate-500 font-medium">Total de Visitas</p>
 <p className="text-sm font-semibold text-slate-800">{filteredVisits.length}</p>
 </div>
 <div>
 <p className="text-xs text-slate-500 font-medium">Idade Atual</p>
 <p className="text-sm font-semibold text-slate-800">{filteredVisits.length > 0 ? Math.max(...filteredVisits.map(v => calculateVisitAge(v, filteredIntegrados[0]))) : 0} dias</p>
 </div>
 <div>
 <p className="text-xs text-slate-500 font-medium">Desvio Atual</p>
 <p className={`text-sm font-semibold ${stats.avgDiferenca > 0 ? 'text-red-600' : stats.avgDiferenca < 0 ? 'text-emerald-600' : 'text-slate-800'}`}>
 {stats.avgDiferenca > 0 ? '+' : ''}{stats.avgDiferenca.toFixed(2)} kg
 </p>
 </div>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-sm text-left">
 <thead className="bg-slate-50 border-b border-slate-200">
 <tr>
 <th className="px-4 py-3 font-semibold text-slate-700">Data</th>
 <th className="px-4 py-3 font-semibold text-slate-700 text-center">Idade</th>
 <th className="px-4 py-3 font-semibold text-slate-700 text-right">Cons. (kg)</th>
 <th className="px-4 py-3 font-semibold text-slate-700 text-right">Meta (kg)</th>
 <th className="px-4 py-3 font-semibold text-slate-700 text-right">Desvio (kg)</th>
 <th className="px-4 py-3 font-semibold text-slate-700 text-center">Alojados</th>
 <th className="px-4 py-3 font-semibold text-slate-700">Tratamentos & Obs</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {filteredVisits.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((v) => {
 const singleIntegrado = filteredIntegrados[0];
 const age = calculateVisitAge(v, singleIntegrado);
 const realConsumo = calculateRealConsumption(v);
 const expected = getExpectedConsumption(age, v.tipoLote, v.pesoAloj, singleIntegrado?.alojamentoDate, singleIntegrado?.status, singleIntegrado?.fechamentoDate, currentConfig, undefined, v.date);
 const dif = realConsumo > 0 ? Number((realConsumo - expected).toFixed(2)) : 0;
 const hasTratamentos = v.tratamentos && v.tratamentos.length > 0;
 return (
 <tr key={v.id} className="hover:bg-slate-50">
 <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{v.date.split('-').reverse().join('/')}</td>
 <td className="px-4 py-3 text-slate-700 text-center">{age}</td>
 <td className="px-4 py-3 text-slate-700 text-right font-medium">{realConsumo.toFixed(2)}</td>
 <td className="px-4 py-3 text-slate-700 text-right">{expected.toFixed(2)}</td>
 <td className={`px-4 py-3 font-semibold text-right ${dif > 0 ? 'text-red-600' : dif < 0 ? 'text-emerald-600' : 'text-slate-700'}`}>
 {dif > 0 ? '+' : ''}{dif.toFixed(2)}
 </td>
 <td className="px-4 py-3 text-slate-700 text-center">{v.animaisAlojados}</td>
 <td className="px-4 py-3 text-slate-700 max-w-xs">
 {hasTratamentos && (
 <div className="flex flex-wrap gap-1 mb-1">
 {v.tratamentos?.map((t, idx) => (
 <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800 border border-amber-200">
 {t.produto} ({t.doseMgKg}mg, {t.duracaoDias}d)
 </span>
 ))}
 </div>
 )}
 {v.recomendacao && (
 <p className="text-xs text-slate-500 truncate" title={v.recomendacao}>
 {v.recomendacao}
 </p>
 )}
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </div>
 )}
</div>
 );
}

