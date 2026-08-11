import React, { useMemo, useState } from 'react';
import { growthCurve, growthCurveFemea, defaultMetas, defaultMetasFemea, getActiveCurve, growthCurvesMisto } from '../data';

export function ReferenceCurve() {
  const [tipoLote, setTipoLote] = useState<'Misto' | 'Fêmea' | 'Macho'>('Misto');
  const [selectedVersion, setSelectedVersion] = useState<string>(growthCurvesMisto[growthCurvesMisto.length - 1].version);

  const currentCurveObj = tipoLote === 'Fêmea' 
    ? { curve: growthCurveFemea, metas: defaultMetasFemea }
    : (growthCurvesMisto.find(c => c.version === selectedVersion) || growthCurvesMisto[growthCurvesMisto.length - 1]);

  const activeCurve = currentCurveObj.curve;
  const activeMetas = currentCurveObj.metas;

  const fullCurve = useMemo(() => {
    const sorted = [...activeCurve].sort((a, b) => a.dia - b.dia);
    const full = [];
    const maxDia = sorted[sorted.length - 1].dia;
    
    for (let dia = 1; dia <= maxDia; dia++) {
      const exactMatch = sorted.find(p => p.dia === dia);
      if (exactMatch) {
        full.push(exactMatch);
        continue;
      }
      
      for (let i = 0; i < sorted.length - 1; i++) {
        if (dia > sorted[i].dia && dia < sorted[i+1].dia) {
          const p1 = sorted[i];
          const p2 = sorted[i+1];
          const ratio = (dia - p1.dia) / (p2.dia - p1.dia);
          
          full.push({
            dia,
            pesoInicial: p1.pesoInicial + ratio * (p2.pesoInicial - p1.pesoInicial),
            pesoFinal: p1.pesoFinal + ratio * (p2.pesoFinal - p1.pesoFinal),
            cmd: p1.cmd + ratio * (p2.cmd - p1.cmd),
            consumoAcumulado: p1.consumoAcumulado + ratio * (p2.consumoAcumulado - p1.consumoAcumulado),
            gpd: p1.gpd + ratio * (p2.gpd - p1.gpd)
          });
          break;
        }
      }
    }
    return full;
  }, [activeCurve]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
        
        <div className="flex flex-col sm:flex-row bg-slate-100 p-1 rounded-lg w-full md:w-auto">
          <button 
            onClick={() => setTipoLote('Misto')}
            className={`flex-1 px-2 sm:px-4 py-2 rounded-md text-sm font-semibold transition-all ${tipoLote === 'Misto' ? 'bg-white shadow text-[#2D452B]' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Lotes Mistos
          </button>
          <button 
            onClick={() => setTipoLote('Macho')}
            className={`flex-1 px-2 sm:px-4 py-2 rounded-md text-sm font-semibold transition-all ${tipoLote === 'Macho' ? 'bg-white shadow text-[#2D452B]' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Lotes Machos
          </button>
          <button 
            onClick={() => setTipoLote('Fêmea')}
            className={`flex-1 px-2 sm:px-4 py-2 rounded-md text-sm font-semibold transition-all ${tipoLote === 'Fêmea' ? 'bg-white shadow text-[#2D452B]' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Lotes Fêmeas
          </button>
                </div>
        {tipoLote !== 'Fêmea' && (
          <div className="md:ml-auto flex flex-col sm:flex-row sm:items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
            <span className="text-xs font-medium text-slate-500">Curva:</span>
            <select
              value={selectedVersion}
              onChange={(e) => setSelectedVersion(e.target.value)}
              className="w-full sm:w-auto px-2 py-1 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#2D452B] focus:border-[#2D452B]"
            >
              {growthCurvesMisto.map(cv => {
                const [y, m, d] = cv.effectiveDate.split('-');
                const dateObj = new Date(Number(y), Number(m)-1, Number(d));
                return (
                  <option key={cv.version} value={cv.version}>
                    {cv.version === growthCurvesMisto[growthCurvesMisto.length - 1].version ? `${cv.version.toUpperCase()} - ${dateObj.toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit', year:'2-digit'})} (Atual)` : `${cv.version.toUpperCase()} - ${dateObj.toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit', year:'2-digit'})}`}
                  </option>
                );
              })}
            </select>
          </div>
        )}
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider p-3 bg-white border-b text-xs border-slate-200">
          Programas Alimentares (Fases) - {tipoLote}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-center text-sm text-slate-600 min-w-[600px]">
            <thead className="bg-[#2D452B] text-white font-medium border-b border-slate-200">
              <tr>
                <th className="px-3 py-2 text-xs">FASE</th>
                <th className="px-3 py-2 text-xs">Aloj</th>
                <th className="px-3 py-2 text-xs">C1</th>
                <th className="px-3 py-2 text-xs">C2</th>
                <th className="px-3 py-2 text-xs">C3</th>
                <th className="px-3 py-2 text-xs">T1</th>
                <th className="px-3 py-2 text-xs">T2</th>
                <th className="px-3 py-2 text-xs bg-[#1A3A5B]">TOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold">
              <tr className="hover:bg-slate-50">
                <td className="px-3 py-2 text-left font-bold bg-[#2D452B] text-white whitespace-nowrap">Dias de Consumo</td>
                <td className="px-3 py-2">14</td>
                <td className="px-3 py-2">{tipoLote === 'Fêmea' ? '14' : '18'}</td>
                <td className="px-3 py-2">14</td>
                <td className="px-3 py-2">{tipoLote === 'Fêmea' ? '14' : '18'}</td>
                <td className="px-3 py-2">10</td>
                <td className="px-3 py-2">{tipoLote === 'Fêmea' ? '14' : '22'}</td>
                <td className="px-3 py-2 font-bold bg-[#1A3A5B] text-white">{tipoLote === 'Fêmea' ? '80' : '96'}</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-3 py-2 text-left font-bold bg-[#2D452B] text-white whitespace-nowrap">Qtdade ração/ fase</td>
                <td className="px-3 py-2">{activeMetas.metaAlojamento.toFixed(2).replace('.', ',')}</td>
                <td className="px-3 py-2">{activeMetas.metaCrescimento1.toFixed(2).replace('.', ',')}</td>
                <td className="px-3 py-2">{activeMetas.metaCrescimento2.toFixed(2).replace('.', ',')}</td>
                <td className="px-3 py-2">{activeMetas.metaCrescimento3.toFixed(2).replace('.', ',')}</td>
                <td className="px-3 py-2">{activeMetas.metaTerminacao1.toFixed(2).replace('.', ',')}</td>
                <td className="px-3 py-2">{activeMetas.metaTerminacao2.toFixed(2).replace('.', ',')}</td>
                <td className="px-3 py-2 font-bold bg-[#1A3A5B] text-white">{activeMetas.metaAcumulada.toFixed(2).replace('.', ',')}</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-3 py-2 text-left font-bold bg-[#2D452B] text-white whitespace-nowrap">CMD</td>
                <td className="px-3 py-2">{(activeMetas.metaAlojamento / 14).toFixed(3).replace('.', ',')}</td>
                <td className="px-3 py-2">{(activeMetas.metaCrescimento1 / (tipoLote === 'Fêmea' ? 14 : 18)).toFixed(3).replace('.', ',')}</td>
                <td className="px-3 py-2">{(activeMetas.metaCrescimento2 / 14).toFixed(3).replace('.', ',')}</td>
                <td className="px-3 py-2">{(activeMetas.metaCrescimento3 / (tipoLote === 'Fêmea' ? 14 : 18)).toFixed(3).replace('.', ',')}</td>
                <td className="px-3 py-2">{(activeMetas.metaTerminacao1 / 10).toFixed(3).replace('.', ',')}</td>
                <td className="px-3 py-2">{(activeMetas.metaTerminacao2 / (tipoLote === 'Fêmea' ? 14 : 22)).toFixed(3).replace('.', ',')}</td>
                <td className="px-3 py-2 font-bold bg-[#1A3A5B] text-white">{(activeMetas.metaAcumulada / (tipoLote === 'Fêmea' ? 80 : 96)).toFixed(3).replace('.', ',')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-center text-sm text-slate-600 min-w-[600px]">
            <thead className="bg-slate-50 text-slate-700 font-medium border-b border-slate-200">
              <tr>
                <th className="px-3 py-2 text-xs">Dia</th>
                <th className="px-3 py-2 text-xs">Peso Inicial (kg)</th>
                <th className="px-3 py-2 text-xs">Peso Final (kg)</th>
                <th className="px-3 py-2 text-xs">Consumo Diário (CMD)</th>
                <th className="px-3 py-2 text-xs">Consumo Acumulado (kg)</th>
                <th className="px-3 py-2 text-xs">Ganho Diário (GPD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fullCurve.map((row) => (
                <tr key={row.dia} className="hover:bg-slate-50">
                  <td className="px-3 py-2 font-semibold text-slate-800">{row.dia}</td>
                  <td className="px-3 py-2">{row.pesoInicial.toFixed(2)}</td>
                  <td className="px-3 py-2">{row.pesoFinal.toFixed(2)}</td>
                  <td className="px-3 py-2">{row.cmd.toFixed(3)}</td>
                  <td className="px-3 py-2 font-medium text-blue-600">{row.consumoAcumulado.toFixed(2)}</td>
                  <td className="px-3 py-2">{row.gpd.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
