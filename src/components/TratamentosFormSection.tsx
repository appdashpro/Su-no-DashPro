import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Tratamento, GrowthCurvePoint } from '../types';
import { getActiveCurve } from '../data';

interface Props {
  tratamentos: Tratamento[];
  onChange: (tratamentos: Tratamento[]) => void;
  idade: number;
  animaisVivos: number;
  tipoLote: 'Misto' | 'Fêmea' | 'Macho';
  alojamentoDate?: string;
}

export function TratamentosFormSection({ tratamentos, onChange, idade, animaisVivos, tipoLote, alojamentoDate }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Find expected weight based on age and curve
  const { curve } = getActiveCurve(alojamentoDate, 'Em andamento', tipoLote);
  const expectedWeightPoint = curve.find((p: GrowthCurvePoint) => p.dia >= (idade || 0));
  const pesoEstimado = expectedWeightPoint ? expectedWeightPoint.pesoInicial : 0;

  const handleAdd = () => {
    onChange([
      ...tratamentos,
      {
        id: Math.random().toString(36).substring(7),
        produto: '',
        doseMgKg: 0,
        duracaoDias: 0,
      }
    ]);
  };

  const handleUpdate = (index: number, field: keyof Tratamento, value: any) => {
    const newTratamentos = [...tratamentos];
    newTratamentos[index] = { ...newTratamentos[index], [field]: value };
    
    // Recalculate quantities
    const t = newTratamentos[index];
    if (t.doseMgKg && pesoEstimado && animaisVivos) {
      // Dose is mg per kg of body weight.
      // Total mg per day = dose * weight * animals
      let mgPorDia = t.doseMgKg * pesoEstimado * animaisVivos;
      
      // If concentration is provided (e.g. mg/ml or g/100g -> mg/g), we can adjust, but usually concentration is % or mg/g
      // Let's assume user inputs concentration as needed, or we just calculate active principle if no concentration.
      // Usually Dose is mg active / kg. If concentration is e.g. 50% (500mg/g), we divide by concentration to get product amount.
      let produtoPorDia = mgPorDia;
      if (t.concentracao && t.concentracao > 0) {
        // Assuming concentration is in percentage (e.g., 50 for 50%) -> / (50/100) = / 0.5
        produtoPorDia = mgPorDia / (t.concentracao / 100);
      }
      
      // convert to grams (if mg)
      const gramasPorDia = produtoPorDia / 1000;
      
      newTratamentos[index].quantidadePorDia = Number(gramasPorDia.toFixed(2));
      if (t.duracaoDias) {
        newTratamentos[index].quantidadeTotal = Number((gramasPorDia * t.duracaoDias).toFixed(2));
      } else {
        newTratamentos[index].quantidadeTotal = 0;
      }
    }
    
    onChange(newTratamentos);
  };

  const handleRemove = (index: number) => {
    const newTratamentos = [...tratamentos];
    newTratamentos.splice(index, 1);
    onChange(newTratamentos);
  };

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white mt-4">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 bg-slate-50 flex items-center justify-between text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span>Registrar Tratamento Medicamentoso</span>
          {tratamentos.length > 0 && (
            <span className="bg-blue-100 text-blue-700 text-xs py-0.5 px-2 rounded-full">
              {tratamentos.length}
            </span>
          )}
        </div>
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {isExpanded && (
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-2 rounded">
            <div>Idade base: <span className="font-semibold text-slate-700">{idade || 0} dias</span></div>
            <div>Peso est.: <span className="font-semibold text-slate-700">{pesoEstimado.toFixed(2)} kg</span></div>
            <div>Animais: <span className="font-semibold text-slate-700">{animaisVivos}</span></div>
          </div>

          {tratamentos.map((tratamento, index) => (
            <div key={tratamento.id} className="p-3 border border-slate-200 rounded-md bg-slate-50 relative">
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Produto / Princípio Ativo</label>
                  <input
                    type="text"
                    value={tratamento.produto}
                    onChange={(e) => handleUpdate(index, 'produto', e.target.value)}
                    className="w-full border border-slate-200 rounded p-1.5 text-sm"
                    placeholder="Ex: Amoxicilina"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Dose (mg/kg peso vivo)</label>
                  <input
                    type="number"
                    value={tratamento.doseMgKg || ''}
                    onChange={(e) => handleUpdate(index, 'doseMgKg', parseFloat(e.target.value))}
                    className="w-full border border-slate-200 rounded p-1.5 text-sm"
                    placeholder="Ex: 20"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Concentração do Produto (%) <span className="text-[10px]">(Opcional)</span></label>
                  <input
                    type="number"
                    value={tratamento.concentracao || ''}
                    onChange={(e) => handleUpdate(index, 'concentracao', parseFloat(e.target.value))}
                    className="w-full border border-slate-200 rounded p-1.5 text-sm"
                    placeholder="Ex: 50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Duração (Dias)</label>
                  <input
                    type="number"
                    value={tratamento.duracaoDias || ''}
                    onChange={(e) => handleUpdate(index, 'duracaoDias', parseInt(e.target.value))}
                    className="w-full border border-slate-200 rounded p-1.5 text-sm"
                    placeholder="Ex: 5"
                  />
                </div>
              </div>
              
              {tratamento.doseMgKg > 0 && tratamento.duracaoDias > 0 && (
                <div className="bg-blue-50 border border-blue-100 p-2 rounded text-xs text-blue-800 flex justify-between">
                  <div>
                    <span className="block text-blue-600/70">Quantidade (g/dia):</span>
                    <span className="font-semibold text-sm">{tratamento.quantidadePorDia} g</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-blue-600/70">Total Tratamento:</span>
                    <span className="font-semibold text-sm">{tratamento.quantidadeTotal} g</span>
                  </div>
                </div>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={handleAdd}
            className="w-full py-2 border-2 border-dashed border-slate-300 rounded text-slate-500 font-medium text-sm hover:border-blue-400 hover:text-blue-500 transition-colors flex items-center justify-center gap-1"
          >
            <Plus className="h-4 w-4" /> Adicionar Medicamento
          </button>
        </div>
      )}
    </div>
  );
}
