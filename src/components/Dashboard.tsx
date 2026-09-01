import { safeStorage } from "../lib/safeStorage";
import { getEmpresaConfigsLocal } from "../lib/storage";
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { 
 ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
 BarChart, Bar, Cell, ReferenceArea, LabelList, ScatterChart, Scatter, ZAxis
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
  const [showPreviousCurve, setShowPreviousCurve] = useState(false);
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
    let chartConfig: any = undefined;

    if (filteredIntegrados.length > 0) {
      const firstEmpresaId = filteredIntegrados[0].empresaId;
      const allSameEmpresa = filteredIntegrados.every(i => i.empresaId === firstEmpresaId);
      if (allSameEmpresa && firstEmpresaId) {
        chartConfig = configs.find(c => c.empresa_id === firstEmpresaId);
      }
    }

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
      
      let dDateStr = singleAlojamentoDate || '2000-01-01';
      if (singleAlojamentoDate) {
         const dDate = new Date(singleAlojamentoDate + 'T12:00:00');
         dDate.setDate(dDate.getDate() + (idade - 1));
         dDateStr = dDate.toISOString().split('T')[0];
      }

      let previousCurveDate = '2000-01-01';
      let latestCurveDate = '2099-01-01';
      if (chartConfig?.curva_desempenho && Array.isArray(chartConfig.curva_desempenho) && chartConfig.curva_desempenho.length > 0) {
        const sorted = [...chartConfig.curva_desempenho].sort((a: any, b: any) => (a.dataVigencia || "").localeCompare(b.dataVigencia || ""));
        previousCurveDate = sorted[0].dataVigencia;
        latestCurveDate = sorted[sorted.length - 1].dataVigencia;
      }

      const expected = getExpectedConsumption(
        idade, 
        dominantTipoLote, 
        avgPesoAloj, 
        singleAlojamentoDate, 
        singleStatus, 
        singleFechamentoDate,
        chartConfig,
        undefined,
        latestCurveDate
      );

      const expectedAnterior = getExpectedConsumption(
        idade, 
        dominantTipoLote, 
        avgPesoAloj, 
        singleAlojamentoDate, 
        singleStatus, 
        singleFechamentoDate,
        chartConfig,
        undefined,
        previousCurveDate
      );
      
      const dataPoint: any = {
        idade,
      };
      if (expected > 0) {
        dataPoint.consumoEsperado = expected;
        dataPoint.consumoEsperadoRange = [Math.max(0, expected - 5), expected + 5];
      }
      if (expectedAnterior > 0) {
        dataPoint.esperadoAnterior = expectedAnterior;
      }
      
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
        
        const currentConfig = configs.find(c => c.empresa_id === integrado?.empresaId);
        const expected = getExpectedConsumption(
          age,
          v.tipoLote,
          v.pesoAloj,
          integrado?.alojamentoDate,
          integrado?.status,
          integrado?.fechamentoDate,
          currentConfig,
          undefined,
          v.date
        );
        
        const mortPct = calculateMortalityRate(v);
        const parseScore = (s?: number) => { if(!s) return 0; if(s===1) return 3; if(s===2) return 2; if(s===3) return 1; return 0; };
        const ev = v.avaliacao_tecnica;
        let sanitIndex = 100;
        if (ev) {
          const validScores: {score: number}[] = [];
          if (ev.suinos?.diarreia) validScores.push({score: parseScore(ev.suinos.diarreia)});
          if (ev.suinos?.tosse) validScores.push({score: parseScore(ev.suinos.tosse)});
          if (ev.suinos?.uniformidade) validScores.push({score: parseScore(ev.suinos.uniformidade)});
          if (ev.suinos?.canibalismo) validScores.push({score: parseScore(ev.suinos.canibalismo)});
          if (ev.suinos?.prolapso) validScores.push({score: parseScore(ev.suinos.prolapso)});
          if (ev.granja?.limpeza_baias) validScores.push({score: parseScore(ev.granja.limpeza_baias)});
          if (ev.granja?.desperdicio_racao) validScores.push({score: parseScore(ev.granja.desperdicio_racao)});
          if (ev.granja?.ventilacao_cortinas) validScores.push({score: parseScore(ev.granja.ventilacao_cortinas)});
          if (ev.granja?.ficha_lote) validScores.push({score: parseScore(ev.granja.ficha_lote)});

          if (validScores.length > 0) {
            const totalMax = validScores.length * 3;
            const currentScore = validScores.reduce((acc, curr) => acc + curr.score, 0);
            sanitIndex = Math.round((currentScore / totalMax) * 100);
          }
        }


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
          consumoEsperado: expected > 0 ? expected : null,
          diferenca: expected > 0 ? Number((realConsumo - expected).toFixed(2)) : 0,
          mortalidade: mortPct,
          sanidade: sanitIndex,
          aderencia: expected > 0 && realConsumo > 0 ? Math.max(0, 100 - (Math.abs(realConsumo - expected) / expected * 100)) : 100,
          animaisMortos: v.animaisMortos,
          animaisAlojados: v.animaisAlojados,
        };
      }).sort((a, b) => {
        switch (sortBy) {
          case 'name-desc':
            return (b.name || "").localeCompare(a.name || "");
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
            return (a.name || "").localeCompare(b.name || "");
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

  const { regressionLine, rSquared } = useMemo(() => {
    if (latestVisitsData.length < 2) return { regressionLine: [], rSquared: 0 };
    
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    const n = latestVisitsData.length;
    
    let minX = Infinity;
    let maxX = -Infinity;

    latestVisitsData.forEach(d => {
      const x = d.sanidade;
      const y = d.mortalidade;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
      sumY2 += y * y;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
    });

    const denominator = (n * sumX2 - sumX * sumX);
    if (denominator === 0) return { regressionLine: [], rSquared: 0 };

    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;

    // Calculate R-squared
    const meanY = sumY / n;
    let ssTot = 0;
    let ssRes = 0;
    latestVisitsData.forEach(d => {
      const x = d.sanidade;
      const y = d.mortalidade;
      const predictedY = slope * x + intercept;
      ssTot += Math.pow(y - meanY, 2);
      ssRes += Math.pow(y - predictedY, 2);
    });
    
    const r2 = ssTot === 0 ? 1 : 1 - (ssRes / ssTot);

    // Give some padding to the line for visual effect
    const paddingX = (maxX - minX) * 0.1 || 5;
    const startX = Math.max(0, minX - paddingX);
    const endX = Math.min(100, maxX + paddingX);

    return {
      regressionLine: [
        { sanidade: startX, mortalidade: slope * startX + intercept },
        { sanidade: endX, mortalidade: slope * endX + intercept }
      ],
      rSquared: r2
    };
  }, [latestVisitsData]);

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
    <div className="space-y-6" ref={dashboardRef}>
      {!isExporting && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Visão Geral dos Lotes</h2>
            <p className="text-xs text-slate-500">Métricas consolidadas e análise de performance</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto items-center">
            {selectedIntegradoIds.length === 1 && (
              <button
                onClick={handleExportPDF}
                className="flex items-center justify-center gap-2 text-sm text-white bg-slate-800 hover:bg-slate-900 px-4 py-2 rounded-lg shadow-sm w-full md:w-auto font-medium transition-colors"
              >
                <FileDown className="w-4 h-4" />
                Gerar PDF
              </button>
            )}

            <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg w-full md:w-auto">
              <ArrowUpDown className="w-4 h-4" />
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent outline-none cursor-pointer text-slate-700 font-medium w-full"
              >
                <option value="name-asc">Nome (A-Z)</option>
                <option value="name-desc">Nome (Z-A)</option>
                <option value="diferenca-desc">Maior Fuga (+kg)</option>
                <option value="diferenca-asc">Menor Fuga (-kg)</option>
                <option value="idade-desc">Mais Velhos</option>
                <option value="idade-asc">Mais Novos</option>
              </select>
            </div>

            <div className="relative w-full md:w-48">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-slate-700 font-medium"
              >
                <option value="all">Todo o período</option>
                <option value="30">Últimos 30 dias</option>
                <option value="60">Últimos 60 dias</option>
                <option value="90">Últimos 90 dias</option>
              </select>
            </div>
            
            <div className="relative w-full md:w-64" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium flex items-center justify-between"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <span className="truncate ml-2">
                    {selectedIntegradoIds.length === 0 
                      ? 'Todos os Produtores' 
                      : selectedIntegradoIds.length === 1 
                        ? integrados.find(i => i.id === selectedIntegradoIds[0])?.name || 'Selecionado'
                        : `${selectedIntegradoIds.length} selecionados`}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {isDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                  <div 
                    className="flex items-center px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100"
                    onClick={() => {
                      setSelectedIntegradoIds([]);
                      setIsDropdownOpen(false);
                    }}
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
                          if (isSelected) {
                            setSelectedIntegradoIds(selectedIntegradoIds.filter(id => id !== i.id));
                          } else {
                            setSelectedIntegradoIds([...selectedIntegradoIds, i.id]);
                          }
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

      {/* KPIs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Integrados */}
        <div 
          onClick={() => setActiveKpiModal('total')}
          className="bg-white border border-slate-200 rounded-xl py-3 px-4 shadow-sm flex flex-col justify-between cursor-pointer hover:border-slate-400 hover:shadow-md transition-all group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-12 h-12 bg-slate-50 rounded-bl-[40px] z-0 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lotes em Andamento</p>
              <div className="text-slate-300 group-hover:text-slate-500 transition-colors">
                <ChevronDown className="w-4 h-4 -rotate-90" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-800">{stats.totalIntegrados}</p>
          </div>
          <p className="text-[10px] text-slate-400 font-medium mt-2 relative z-10">Lotes ativos vinculados aos produtores</p>
        </div>

        {/* Alertas */}
        <div 
          onClick={() => setActiveKpiModal('alertas')}
          className={`border rounded-xl py-3 px-4 shadow-sm flex flex-col justify-between cursor-pointer hover:shadow-md transition-all group relative overflow-hidden ${stats.alertCount > 0 ? 'bg-red-50 border-red-200 hover:border-red-400' : 'bg-emerald-50 border-emerald-200 hover:border-emerald-400'}`}
        >
          <div className={`absolute top-0 right-0 w-12 h-12 rounded-bl-[40px] z-0 transition-transform group-hover:scale-110 ${stats.alertCount > 0 ? 'bg-red-100/50' : 'bg-emerald-100/50'}`}></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-1">
              <p className={`text-xs font-bold uppercase tracking-wider ${stats.alertCount > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                Alertas de Consumo
              </p>
              <div className={`${stats.alertCount > 0 ? 'text-red-300 group-hover:text-red-500' : 'text-emerald-300 group-hover:text-emerald-500'} transition-colors`}>
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <p className={`text-2xl font-black ${stats.alertCount > 0 ? 'text-red-800' : 'text-emerald-800'}`}>{stats.alertCount}</p>
          </div>
          <p className={`text-[10px] font-medium mt-2 relative z-10 ${stats.alertCount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
            Desvio superior a ±5kg na última visita
          </p>
        </div>

        {/* Desvio Médio */}
        <div 
          onClick={() => setActiveKpiModal('desvio')}
          className="bg-white border border-slate-200 rounded-xl py-3 px-4 shadow-sm flex flex-col justify-between cursor-pointer hover:border-slate-400 hover:shadow-md transition-all group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-12 h-12 bg-slate-50 rounded-bl-[40px] z-0 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Desvio Médio</p>
              <div className="text-slate-300 group-hover:text-slate-500 transition-colors">
                {stats.avgDiferenca > 0 ? <TrendingUp className="w-4 h-4 text-red-400" /> : <TrendingDown className="w-4 h-4 text-emerald-400" />}
              </div>
            </div>
            <p className={`text-2xl font-black ${stats.avgDiferenca > 5 ? 'text-red-600' : stats.avgDiferenca < -5 ? 'text-emerald-600' : 'text-blue-600'}`}>
              {stats.avgDiferenca > 0 ? '+' : ''}{stats.avgDiferenca.toFixed(2)} kg
            </p>
          </div>
          <p className="text-[10px] text-slate-400 font-medium mt-2 relative z-10">Impacto médio na conversão alimentar</p>
        </div>

        {/* Mortalidade */}
        <div 
          onClick={() => setActiveKpiModal('mortalidade')}
          className="bg-slate-800 rounded-xl py-3 px-4 shadow-sm flex flex-col justify-between cursor-pointer hover:bg-slate-900 transition-all group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-12 h-12 bg-slate-700 opacity-50 rounded-bl-[40px] z-0 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-1">
              <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Mortalidade Média</p>
              <div className="text-slate-500 group-hover:text-slate-300 transition-colors">
                <ChevronDown className="w-4 h-4 -rotate-90" />
              </div>
            </div>
            <p className="text-2xl font-black text-white">{stats.avgMortalidade.toFixed(2)}%</p>
          </div>
          <p className="text-[10px] text-slate-400 font-medium mt-2 relative z-10">
             {currentConfig?.meta_mortalidade ? `Meta configurada: ${currentConfig.meta_mortalidade}%` : 'Média dos lotes em andamento'}
           </p>
        </div>
      </div>

      {/* KPI Modals */}
      {activeKpiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                {activeKpiModal === 'total' && 'Todos os Lotes em Andamento'}
                {activeKpiModal === 'alertas' && 'Lotes com Alertas de Consumo (>5kg desvio)'}
                {activeKpiModal === 'desvio' && 'Impacto no Desvio de Consumo'}
                {activeKpiModal === 'mortalidade' && 'Impacto na Mortalidade'}
              </h3>
              <button onClick={() => setActiveKpiModal(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-0">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-white sticky top-0 shadow-sm">
                  <tr>
                    <th className="px-5 py-4 font-semibold border-b border-slate-200">Lote</th>
                    <th className="px-5 py-4 font-semibold border-b border-slate-200 text-center">Idade</th>
                    {activeKpiModal === 'mortalidade' ? (
                      <th className="px-5 py-4 font-semibold border-b border-slate-200 text-right">Mortalidade</th>
                    ) : (
                      <th className="px-5 py-4 font-semibold border-b border-slate-200 text-right">Desvio (kg)</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {latestVisitsData
                    .filter(row => {
                      if (activeKpiModal === 'alertas') return row.diferenca < -5 || row.diferenca > 5;
                      return true;
                    })
                    .sort((a, b) => {
                      if (activeKpiModal === 'mortalidade') return b.mortalidade - a.mortalidade;
                      return Math.abs(b.diferenca) - Math.abs(a.diferenca);
                    })
                    .map((row) => {
                      const mVal = row.animaisMortos !== undefined ? (Number(row.animaisMortos) / Number(row.animaisAlojados)) * 100 : Number(row.mortalidade || 0);
                      const configRow = configs.find(c => c.empresa_id === integrados.find(i => i.id === row.integradoId)?.empresaId);
                      const finalMeta = configRow?.meta_mortalidade !== undefined && configRow?.meta_mortalidade !== null ? configRow.meta_mortalidade : 3;
                      const propMeta = row.idade ? Number(((Math.min(row.idade, 105) / 105) * finalMeta).toFixed(2)) : finalMeta;
                      
                      return (
                        <tr key={row.id} className="hover:bg-slate-50">
                          <td 
                            className={`px-5 py-3 font-medium whitespace-nowrap ${onNavigateToVisit ? 'text-blue-600 hover:text-blue-800 cursor-pointer' : 'text-slate-800'}`}
                            onClick={() => {
                              if (onNavigateToVisit) {
                                setActiveKpiModal(null);
                                onNavigateToVisit(row.id);
                              }
                            }}
                          >
                            {row.fullName}
                          </td>
                          <td className="px-5 py-3 text-slate-600 text-center">{row.idade} d</td>
                          {activeKpiModal === 'mortalidade' ? (
                            <td className="px-5 py-3 text-right">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${mVal > propMeta ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                {mVal.toFixed(2)}%
                              </span>
                            </td>
                          ) : (
                            <td className="px-5 py-3 text-right">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${(Math.abs(row.diferenca) <= 5) ? 'bg-blue-100 text-blue-700' : row.diferenca < -5 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                {row.diferenca > 0 ? '+' : ''}{row.diferenca.toFixed(2)} kg
                              </span>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 text-right">
              <button 
                onClick={() => setActiveKpiModal(null)}
                className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors text-sm font-medium"
              >
                Fechar Detalhamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Composed Chart - Line Acompanhamento */}
        <div className="xl:col-span-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col min-h-[450px]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-800">Acompanhamento de Consumo Geral</h2>
              <p className="text-xs text-slate-500 mt-1">Comparativo de consumo acumulado dos lotes ativos</p>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                <input 
                  type="checkbox" 
                  checked={showPreviousCurve} 
                  onChange={(e) => setShowPreviousCurve(e.target.checked)}
                  className="rounded text-blue-500 focus:ring-blue-500"
                />
                Exibir curva anterior
              </label>
            </div>
          </div>
          
          <div className="flex-1 min-h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="idade" type="number" domain={[1, 100]} tickCount={10} label={{ value: 'Idade (Dias)', position: 'insideBottom', offset: -10 }} stroke="#94a3b8" fontSize={11} tick={{fill: '#64748b'}} />
                <YAxis label={{ value: 'Consumo Acumulado (kg)', angle: -90, position: 'insideLeft', offset: 15 }} stroke="#94a3b8" fontSize={11} tick={{fill: '#64748b'}} />
                
                {/* Fases de Ração */}
                {/* @ts-ignore */}
                <ReferenceArea x1={1} x2={14} fill="#f8fafc" fillOpacity={0.8} label={{ value: 'Aloj', position: 'insideTop', fill: '#94a3b8', fontSize: 10, offset: 10 }} />
                {/* @ts-ignore */}
                <ReferenceArea x1={14} x2={32} fill="#f1f5f9" fillOpacity={0.8} label={{ value: 'C1', position: 'insideTop', fill: '#94a3b8', fontSize: 10, offset: 10 }} />
                {/* @ts-ignore */}
                <ReferenceArea x1={32} x2={46} fill="#e2e8f0" fillOpacity={0.8} label={{ value: 'C2', position: 'insideTop', fill: '#94a3b8', fontSize: 10, offset: 10 }} />
                {/* @ts-ignore */}
                <ReferenceArea x1={46} x2={64} fill="#f8fafc" fillOpacity={0.8} label={{ value: 'C3', position: 'insideTop', fill: '#94a3b8', fontSize: 10, offset: 10 }} />
                {/* @ts-ignore */}
                <ReferenceArea x1={64} x2={74} fill="#f1f5f9" fillOpacity={0.8} label={{ value: 'T1', position: 'insideTop', fill: '#94a3b8', fontSize: 10, offset: 10 }} />
                {/* @ts-ignore */}
                <ReferenceArea x1={74} x2={96} fill="#e2e8f0" fillOpacity={0.8} label={{ value: 'T2', position: 'insideTop', fill: '#94a3b8', fontSize: 10, offset: 10 }} />

                <Tooltip 
                  cursor={{ stroke: '#cbd5e1' }} 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', padding: '12px' }}
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
                    height={46} 
                    iconType="circle" 
                    wrapperStyle={{ fontSize: '11px', fontWeight: 500 }}
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
                        return [name, { value: name, type: 'circle', id: integrado.id, color: colors[index % colors.length] }];
                      })).values()) as any[]
                    ] as any[]}
                  />
                )}

                <Area isAnimationActive={!isExporting} type="monotone" dataKey="consumoEsperadoRange" name="Margem de Erro (±5kg)" stroke="none" fill="#cbd5e1" fillOpacity={0.3} activeDot={false} />
                <Line isAnimationActive={!isExporting} type="monotone" dataKey="consumoEsperado" name="Curva Alvo" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                
                {showPreviousCurve && <Line isAnimationActive={!isExporting} type="monotone" dataKey="esperadoAnterior" name="Curva Anterior" stroke="#f97316" strokeWidth={2} strokeOpacity={0.5} strokeDasharray="4 4" dot={false} />}
                
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
                      isAnimationActive={!isExporting} 
                      key={integrado.id} 
                      type="monotone" 
                      dataKey={integrado.id} 
                      name={abbreviateName(integrado.name)} 
                      stroke={colors[index % colors.length]} 
                      strokeWidth={3} 
                      dot={{ r: dotRadius, strokeWidth: 2, fill: '#fff' }} 
                      activeDot={{ r: activeDotRadius, strokeWidth: 0 }} 
                      connectNulls={true} 
                    />
                  );
                })}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Scatter Chart - Correlation */}
        <div className="xl:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col min-h-[450px]">
          
          <div className="mb-6">
            <h2 className="text-base font-bold text-slate-800">Sanidade vs Mortalidade</h2>
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-slate-500">Correlação na última avaliação dos lotes</p>
              {latestVisitsData.length >= 2 && (
                <div className="text-xs font-semibold text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                  R² = {rSquared.toFixed(4)}
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 min-h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  type="number" 
                  dataKey="sanidade" 
                  name="Sanidade" 
                  unit="%" 
                  domain={['auto', 'auto']} 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  label={{ value: 'Índice de Sanidade (%)', position: 'bottom', offset: 0 }} 
                  tick={{fill: '#64748b'}} 
                />
                <YAxis 
                  type="number" 
                  dataKey="mortalidade" 
                  name="Mortalidade" 
                  unit="%" 
                  domain={['auto', 'auto']} 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  label={{ value: 'Mortalidade (%)', angle: -90, position: 'insideLeft', offset: 25 }} 
                  tick={{fill: '#64748b'}} 
                />
                <ZAxis type="category" dataKey="name" name="Lote" />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }} 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                  formatter={(value, name) => [`${Number(value).toFixed(1)}%`, name === 'sanidade' ? 'Sanidade' : name === 'mortalidade' ? 'Mortalidade' : name]}
                />
                <Scatter name="Lotes" data={latestVisitsData} fill="#3b82f6" shape="circle">
                  {latestVisitsData.map((entry, index) => {
                    let color = '#3b82f6'; // Azul - Normal
                    if (entry.sanidade < 85 || entry.mortalidade > 3.0) color = '#ef4444'; // Vermelho - Alerta
                    else if (entry.sanidade >= 95 && entry.mortalidade < 1.5) color = '#10b981'; // Verde - Ótimo
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Scatter>
                {latestVisitsData.length >= 2 && (
                  <Line 
                    data={regressionLine} 
                    type="linear" 
                    dataKey="mortalidade" 
                    stroke="#f97316" 
                    strokeWidth={2} 
                    strokeDasharray="5 5" 
                    dot={false} 
                    activeDot={false} 
                    name="Tendência" 
                    isAnimationActive={false}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center gap-4 mt-2 border-t border-slate-100 pt-3">
             <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-500"></div><span className="text-[10px] text-slate-500 font-medium">Ótimo</span></div>
             <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-500"></div><span className="text-[10px] text-slate-500 font-medium">Normal</span></div>
             <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500"></div><span className="text-[10px] text-slate-500 font-medium">Alerta</span></div>
          </div>
        </div>

        {/* Bar Chart - Desvio */}
        <div className="xl:col-span-12 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col min-h-[450px]">
          <div className="mb-6">
            <h2 className="text-base font-bold text-slate-800">Desvio de Consumo por Lote</h2>
            <p className="text-xs text-slate-500 mt-1">Comparativo de fuga (+/- kg) da última visita</p>
          </div>
          <div className="flex-1 min-h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={latestVisitsData} margin={{ top: 20, right: 20, bottom: 50, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} angle={-45} textAnchor="end" tick={{fill: '#64748b'}} interval={0} />
                <YAxis stroke="#94a3b8" fontSize={11} tick={{fill: '#64748b'}} />
                <Tooltip 
                  cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }} 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                  formatter={(value: any) => [`${value > 0 ? '+' : ''}${Number(value).toFixed(2)} kg`, 'Fuga da Meta']} 
                />
                <Bar isAnimationActive={!isExporting} dataKey="diferenca" name="Fuga da Meta" radius={[4, 4, 0, 0]} maxBarSize={50}>
                  { latestVisitsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={(Math.abs(entry.diferenca) <= 5) ? '#3b82f6' : entry.diferenca < -5 ? '#10b981' : '#ef4444'} />
                  )) }
                  <LabelList 
                    dataKey="diferenca" 
                    position="top" 
                    fill="#64748b" 
                    fontSize={10} 
                    fontWeight={600} 
                    formatter={(val: any) => val > 0 ? `+${Number(val).toFixed(1)}` : Number(val).toFixed(1)} 
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table - Last Visits Summary */}
        <div className="xl:col-span-12 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col min-h-[450px]">
          <div className="mb-6">
            <h2 className="text-base font-bold text-slate-800">Ranking Analítico dos Lotes</h2>
            <p className="text-xs text-slate-500 mt-1">Visão detalhada de performance na última visita</p>
          </div>
          
          <div className="flex-1 overflow-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-4 font-bold border-b border-slate-200">Lote</th>
                  <th className="px-4 py-4 font-bold border-b border-slate-200 text-center">Idade</th>
                  <th className="px-4 py-4 font-bold border-b border-slate-200 text-center">Aderência</th>
                  <th className="px-4 py-4 font-bold border-b border-slate-200 text-center">Sanidade</th>
                  <th className="px-4 py-4 font-bold border-b border-slate-200 text-right">Desvio (kg)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {latestVisitsData.length > 0 ? (
                  latestVisitsData.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                      <td 
                        className={`px-4 py-4 font-semibold whitespace-nowrap ${onNavigateToVisit ? 'text-blue-600 hover:text-blue-800 cursor-pointer' : 'text-slate-800'}`}
                        onClick={() => onNavigateToVisit && onNavigateToVisit(row.id)}
                        title={onNavigateToVisit ? "Clique para ver detalhes do lote" : ""}
                      >
                        {row.name}
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 text-slate-600 uppercase tracking-wider">
                          {row.tipoLote.substring(0, 3)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-600 font-medium text-center">{row.idade} d</td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold ${row.aderencia >= 90 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {Math.round(row.aderencia)}%
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold ${row.sanidade >= 85 ? 'bg-emerald-100 text-emerald-700' : row.sanidade >= 65 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                          {row.sanidade}%
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                          (Math.abs(row.diferenca) <= 5) ? 'bg-blue-100 text-blue-700' : row.diferenca < -5 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {row.diferenca > 0 ? '+' : ''}{row.diferenca.toFixed(2)} kg
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-slate-500 font-medium">
                      Nenhum dado encontrado para os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Export view - hidden from normal display */}
      {isExporting && selectedIntegradoIds.length === 1 && (
        <div className="mt-8 bg-white p-8 rounded-2xl border border-slate-200" style={{ pageBreakInside: 'avoid' }}>
          <h2 className="text-2xl font-black text-slate-800 mb-6">Relatório Detalhado: {filteredIntegrados[0]?.name}</h2>
          
          <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Data de Alojamento</p>
              <p className="text-lg font-black text-slate-800 mt-1">{filteredIntegrados[0]?.alojamentoDate ? filteredIntegrados[0].alojamentoDate.split('-').reverse().join('/') : 'N/D'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total de Visitas</p>
              <p className="text-lg font-black text-slate-800 mt-1">{filteredVisits.length}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Idade Atual</p>
              <p className="text-lg font-black text-slate-800 mt-1">{filteredVisits.length > 0 ? Math.max(...filteredVisits.map(v => calculateVisitAge(v, filteredIntegrados[0]))) : 0} dias</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Desvio Atual</p>
              <p className={`text-lg font-black mt-1 ${stats.avgDiferenca > 0 ? 'text-red-600' : stats.avgDiferenca < 0 ? 'text-emerald-600' : 'text-slate-800'}`}>
                {stats.avgDiferenca > 0 ? '+' : ''}{stats.avgDiferenca.toFixed(2)} kg
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-4 font-bold text-slate-700">Data</th>
                  <th className="px-5 py-4 font-bold text-slate-700 text-center">Idade</th>
                  <th className="px-5 py-4 font-bold text-slate-700 text-right">Cons. (kg)</th>
                  <th className="px-5 py-4 font-bold text-slate-700 text-right">Meta (kg)</th>
                  <th className="px-5 py-4 font-bold text-slate-700 text-right">Desvio (kg)</th>
                  <th className="px-5 py-4 font-bold text-slate-700 text-center">Alojados</th>
                  <th className="px-5 py-4 font-bold text-slate-700">Tratamentos & Obs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVisits.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((v) => {
                  const singleIntegrado = filteredIntegrados.find(i => isVisitForIntegrado(v, i));
                  const currentConfig = configs.find(c => c.empresa_id === singleIntegrado?.empresaId);
                  const age = calculateVisitAge(v, singleIntegrado);
                  const realConsumo = calculateRealConsumption(v);
                  const expected = getExpectedConsumption(age, v.tipoLote, v.pesoAloj, singleIntegrado?.alojamentoDate, singleIntegrado?.status, singleIntegrado?.fechamentoDate, currentConfig, undefined, v.date);
                  const dif = realConsumo > 0 ? Number((realConsumo - expected).toFixed(2)) : 0;
                  const hasTratamentos = v.tratamentos && v.tratamentos.length > 0;
                  
                  return (
                    <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4 text-slate-700 font-medium whitespace-nowrap">{v.date.split('-').reverse().join('/')}</td>
                      <td className="px-5 py-4 text-slate-600 text-center font-medium">{age}</td>
                      <td className="px-5 py-4 text-slate-800 text-right font-bold">{realConsumo.toFixed(2)}</td>
                      <td className="px-5 py-4 text-slate-600 text-right font-medium">{expected.toFixed(2)}</td>
                      <td className={`px-5 py-4 font-black text-right ${dif > 0 ? 'text-red-600' : dif < 0 ? 'text-emerald-600' : 'text-slate-700'}`}>
                        {dif > 0 ? '+' : ''}{dif.toFixed(2)}
                      </td>
                      <td className="px-5 py-4 text-slate-600 text-center font-medium">{v.animaisAlojados}</td>
                      <td className="px-5 py-4 text-slate-700 max-w-xs">
                        {hasTratamentos && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {v.tratamentos?.map((t, idx) => (
                              <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                {t.produto} ({t.doseMgKg}mg, {t.duracaoDias}d)
                              </span>
                            ))}
                          </div>
                        )}
                        {v.recomendacao && (
                          <p className="text-xs text-slate-600 italic leading-snug" title={v.recomendacao}>
                            "{v.recomendacao}"
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
