import React from 'react';
import { AvaliacaoTecnica } from '../types';
import { Check, AlertTriangle, AlertCircle } from 'lucide-react';

interface Props {
  data: AvaliacaoTecnica | null | undefined;
  onChange: (data: AvaliacaoTecnica) => void;
}

const INDICATORS = {
  granja: [
    { key: 'limpeza_baias', label: 'Limpeza das Baias' },
    { key: 'desperdicio_racao', label: 'Desperdício Ração' },
    { key: 'ventilacao_cortinas', label: 'Ventilação/Cortinas' },
    { key: 'ficha_lote', label: 'Ficha do Lote' }
  ],
  suinos: [
    { key: 'tosse', label: 'Tosse' },
    { key: 'diarreia', label: 'Diarreia' },
    { key: 'uniformidade', label: 'Uniformidade' },
    { key: 'canibalismo', label: 'Canibalismo' },
    { key: 'prolapso', label: 'Prolapso' },
    { key: 'parecer_medicacao', label: 'Medicação Injetável' }
  ]
};

export function AvaliacaoTecnicaSection({ data, onChange }: Props) {
  const handleSet = (group: 'granja' | 'suinos', key: string, targetValue: number) => {
    const current = (data as any)?.[group]?.[key] || 0;
    const nextValue = current === targetValue ? 0 : targetValue; // Toggle off se clicar no mesmo
    
    const newData = {
      granja: {
        limpeza_baias: 0, desperdicio_racao: 0, ventilacao_cortinas: 0, ficha_lote: 0,
        ...(data?.granja || {})
      },
      suinos: {
        tosse: 0, diarreia: 0, uniformidade: 0, canibalismo: 0, prolapso: 0, parecer_medicacao: 0,
        ...(data?.suinos || {})
      }
    };

    (newData[group] as any)[key] = nextValue;
    onChange(newData);
  };

  const renderIndicator = (group: 'granja' | 'suinos', item: { key: string, label: string }) => {
    const value = (data as any)?.[group]?.[item.key] || 0;
    
    let colorClass = 'bg-white text-slate-600 border-slate-200 hover:border-slate-300';
    
    if (value === 1) {
      colorClass = 'bg-emerald-50 text-emerald-800 border-emerald-200 ring-1 ring-emerald-500';
    } else if (value === 2) {
      colorClass = 'bg-amber-50 text-amber-800 border-amber-200 ring-1 ring-amber-500';
    } else if (value === 3) {
      colorClass = 'bg-red-50 text-red-800 border-red-200 ring-1 ring-red-500';
    }

    return (
      <div className={`flex flex-col items-center justify-between p-2 rounded-xl border transition-all ${colorClass}`}>
        <span className="font-semibold mb-2 text-center leading-tight h-8 flex items-center justify-center text-xs">{item.label}</span>
        
        <div className="flex items-center gap-1 w-full bg-slate-100/50 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => handleSet(group, item.key, 1)}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded transition-all ${value === 1 ? 'bg-emerald-500 text-white shadow-sm ring-1 ring-emerald-600' : 'text-emerald-700/60 hover:bg-emerald-100/50'}`}
          >
            <Check className="w-3.5 h-3.5 mb-0.5" />
            <span className="text-[9px] uppercase font-bold tracking-tighter">Bom</span>
          </button>
          
          <button
            type="button"
            onClick={() => handleSet(group, item.key, 2)}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded transition-all ${value === 2 ? 'bg-amber-500 text-white shadow-sm ring-1 ring-amber-600' : 'text-amber-700/60 hover:bg-amber-100/50'}`}
          >
            <AlertTriangle className="w-3.5 h-3.5 mb-0.5" />
            <span className="text-[9px] uppercase font-bold tracking-tighter">Regular</span>
          </button>
          
          <button
            type="button"
            onClick={() => handleSet(group, item.key, 3)}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded transition-all ${value === 3 ? 'bg-red-500 text-white shadow-sm ring-1 ring-red-600' : 'text-red-700/60 hover:bg-red-100/50'}`}
          >
            <AlertCircle className="w-3.5 h-3.5 mb-0.5" />
            <span className="text-[9px] uppercase font-bold tracking-tighter">Ruim</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 pt-6 pb-2 border-t border-slate-200">
      <div className="flex items-center justify-between">
         <div>
            <h3 className="text-sm font-bold text-slate-700">Avaliação Técnica (Rápida)</h3>
            <p className="text-[11px] text-slate-500">Selecione diretamente o status de cada indicador para avaliação instantânea.</p>
         </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner">
        <div>
           <h4 className="text-xs font-bold text-slate-600 mb-3 flex items-center gap-2 uppercase tracking-wide">
             <div className="w-2 h-2 rounded-full bg-blue-500"></div>
             Granja
           </h4>
           <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-3">
             {INDICATORS.granja.map(item => (
               <React.Fragment key={item.key}>
                 {renderIndicator('granja', item)}
               </React.Fragment>
             ))}
           </div>
        </div>

        <div>
           <h4 className="text-xs font-bold text-slate-600 mb-3 flex items-center gap-2 uppercase tracking-wide">
             <div className="w-2 h-2 rounded-full bg-pink-500"></div>
             Suínos
           </h4>
           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
             {INDICATORS.suinos.map(item => (
               <React.Fragment key={item.key}>
                 {renderIndicator('suinos', item)}
               </React.Fragment>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}
