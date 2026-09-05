import { safeStorage } from "../lib/safeStorage";
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Tratamento, GrowthCurvePoint } from '../types';
import { getActiveCurve, DEFAULT_MEDICAMENTOS_PERMITIDOS, DEFAULT_CAUSAS_MORTALIDADE } from '../data';
import { generateUUID } from '../utils/uuid';

interface MedicationMemory {
  produto: string;
  motivo?: string;
  doseMgKg: number;
  concentracao?: number;
  duracaoDias: number;
  carenciaDias?: number;
}

interface Props {
  tratamentos: Tratamento[];
  onChange: (tratamentos: Tratamento[]) => void;
  idade: number;
  animaisVivos: number;
  tipoLote: 'Misto' | 'Fêmea' | 'Macho';
  alojamentoDate?: string;
  pesoAmostradoKg?: number;
  onPesoChange?: (peso: number | undefined) => void;
  pesoEstimadoBase?: number;
  medicamentosPermitidos?: string[];
  causasMortalidade?: string[];
  empresaConfig?: any;
  curva_consumo_id?: string;
}

export function TratamentosFormSection({ tratamentos, onChange, idade, animaisVivos, tipoLote, alojamentoDate, pesoAmostradoKg, onPesoChange, pesoEstimadoBase, medicamentosPermitidos, causasMortalidade, empresaConfig, curva_consumo_id }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  const [memory, setMemory] = useState<MedicationMemory[]>([]);

  useEffect(() => {
    try {
      const stored = safeStorage.getItem('medicationMemory');
      if (stored) setMemory(JSON.parse(stored));
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (!tratamentos || tratamentos.length === 0) return;
    let newMemory = [...memory];
    let changed = false;
    tratamentos.forEach(t => {
      if (t.produto && t.produto.trim().length > 2 && t.doseMgKg && t.duracaoDias) {
        const existingIdx = newMemory.findIndex(m => m.produto.toLowerCase() === t.produto.trim().toLowerCase());
        const newEntry = {
          produto: t.produto.trim(),
          doseMgKg: t.doseMgKg,
          concentracao: t.concentracao,
          duracaoDias: t.duracaoDias,
          carenciaDias: t.carenciaDias,
          motivo: t.motivo
        };
        if (existingIdx >= 0) {
          if (JSON.stringify(newMemory[existingIdx]) !== JSON.stringify(newEntry) || existingIdx !== 0) {
             newMemory.splice(existingIdx, 1);
             newMemory.unshift(newEntry);
             changed = true;
          }
        } else {
          newMemory.unshift(newEntry);
          changed = true;
        }
      }
    });
    if (changed) {
      newMemory = newMemory.slice(0, 5); // Limitar aos últimos 5
      setMemory(newMemory);
      safeStorage.setItem('medicationMemory', JSON.stringify(newMemory));
    }
  }, [tratamentos, memory]);

  const [localWeightStr, setLocalWeightStr] = useState<string | null>(null);

  useEffect(() => {
    if (pesoAmostradoKg !== undefined && Number(pesoAmostradoKg) > 0) {
      if (localWeightStr === null || parseFloat(localWeightStr) !== pesoAmostradoKg) {
        setLocalWeightStr(String(pesoAmostradoKg));
      }
    } else {
      const tratWeight = tratamentos.find(t => t.pesoEstimadoKg && Number(t.pesoEstimadoKg) > 0)?.pesoEstimadoKg;
      if (tratWeight && (localWeightStr === null || parseFloat(localWeightStr) !== tratWeight)) {
        setLocalWeightStr(String(tratWeight));
      }
    }
  }, [pesoAmostradoKg, tratamentos]);

  // Use provided base estimated weight or fallback to curve
  let pesoEstimadoCurve = pesoEstimadoBase || 0;
  if (!pesoEstimadoCurve) {
    const { curve } = getActiveCurve(alojamentoDate, 'Em andamento', tipoLote, undefined, empresaConfig, curva_consumo_id, new Date().toISOString().split('T')[0]);
    const expectedWeightPoint = curve.find((p: GrowthCurvePoint) => p.dia >= (idade || 0));
    pesoEstimadoCurve = expectedWeightPoint ? expectedWeightPoint.pesoInicial : 0;
  }
  
  const savedTreatmentWeight = tratamentos.find(t => t.pesoEstimadoKg && Number(t.pesoEstimadoKg) > 0)?.pesoEstimadoKg;
  const effectiveWeight = (pesoAmostradoKg !== undefined && Number(pesoAmostradoKg) > 0)
    ? Number(pesoAmostradoKg)
    : (savedTreatmentWeight || (pesoEstimadoCurve > 0 ? pesoEstimadoCurve : 0));

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalWeightStr(val);
    const newWeight = val === '' ? undefined : parseFloat(val);
    if (onPesoChange && !isNaN(newWeight as number)) onPesoChange(newWeight);
    else if (onPesoChange && val === '') onPesoChange(undefined);
    const calcWeight = !isNaN(newWeight as number) && newWeight !== undefined && newWeight > 0 ? newWeight : (pesoEstimadoCurve > 0 ? pesoEstimadoCurve : 0);
    
    // Recalculate all treatments with the calc weight
    if (tratamentos.length > 0) {
      const updated = tratamentos.map(t => {
        if (!t.doseMgKg) return { ...t, pesoEstimadoKg: newWeight };
        
        let mgPorDia = t.doseMgKg * calcWeight * animaisVivos;
        let custoPorKgProduto = 0;
        
        const medPermitidos = activeMedicamentos;
        if (t.produto && medPermitidos) {
          const foundMed = medPermitidos.find((m: any) => (typeof m === 'string' ? m : m.nome) === t.produto);
          if (foundMed && typeof foundMed !== 'string' && foundMed.custoPorKg) {
            custoPorKgProduto = foundMed.custoPorKg;
          }
        }

        let produtoPorDia = mgPorDia;
        if (t.concentracao && t.concentracao > 0) {
          produtoPorDia = mgPorDia / (t.concentracao / 100);
        }
        const gramasPorDia = produtoPorDia / 1000;
        return {
          ...t,
          quantidadePorDia: Number(gramasPorDia.toFixed(2)),
          quantidadeTotal: t.duracaoDias ? Number((gramasPorDia * t.duracaoDias).toFixed(2)) : 0,
          pesoEstimadoKg: newWeight
        };
      });
      onChange(updated);
    }
  };

  const handleAdd = () => {
    onChange([
      ...tratamentos,
      {
        id: generateUUID(),
        produto: '',
        doseMgKg: 0,
        duracaoDias: 0,
        pesoEstimadoKg: effectiveWeight > 0 ? effectiveWeight : undefined
      }
    ]);
  };

  const handleUpdate = (index: number, field: keyof Tratamento, value: any) => {
    const newTratamentos = [...tratamentos];
    let updatedItem = { ...newTratamentos[index], [field]: value };
    
    if (field === 'produto' && value) {
      const mem = memory.find(m => m.produto.toLowerCase() === String(value).trim().toLowerCase());
      if (mem) {
        if (!updatedItem.doseMgKg) updatedItem.doseMgKg = mem.doseMgKg;
        if (!updatedItem.concentracao && mem.concentracao) updatedItem.concentracao = mem.concentracao;
        if (!updatedItem.duracaoDias) updatedItem.duracaoDias = mem.duracaoDias;
        if (!updatedItem.motivo && mem.motivo) updatedItem.motivo = mem.motivo;
        if (!updatedItem.carenciaDias && mem.carenciaDias) updatedItem.carenciaDias = mem.carenciaDias;
      }
    }

    if (effectiveWeight > 0) {
      updatedItem.pesoEstimadoKg = effectiveWeight;
    }
    
    newTratamentos[index] = updatedItem;
    
    // Recalculate quantities
    const t = newTratamentos[index];
    if (t.doseMgKg && effectiveWeight && animaisVivos) {
      // Dose is mg per kg of body weight.
      // Total mg per day = dose * weight * animals
      
      // Dose is mg per kg of body weight.
      // Total mg per day = dose * weight * animals
      let mgPorDia = t.doseMgKg * effectiveWeight * animaisVivos;
      let custoPorKgProduto = 0;
      
      const medPermitidos = activeMedicamentos;
      if (t.produto && medPermitidos) {
        const foundMed = medPermitidos.find((m: any) => (typeof m === 'string' ? m : m.nome) === t.produto);
        if (foundMed && typeof foundMed !== 'string' && foundMed.custoPorKg) {
          custoPorKgProduto = foundMed.custoPorKg;
        }
      }

      
      // If concentration is provided (e.g. mg/ml or g/100g -> mg/g), we can adjust, but usually concentration is % or mg/g
      let produtoPorDia = mgPorDia;
      if (t.concentracao && t.concentracao > 0) {
        produtoPorDia = mgPorDia / (t.concentracao / 100);
      }
      
      // convert to grams (if mg)
      const gramasPorDia = produtoPorDia / 1000;
      
      newTratamentos[index].quantidadePorDia = Number(gramasPorDia.toFixed(2));
      if (t.duracaoDias) {
        newTratamentos[index].quantidadeTotal = Number((gramasPorDia * t.duracaoDias / 1000).toFixed(4));
        newTratamentos[index].custoTotal = Number(((gramasPorDia * t.duracaoDias / 1000) * custoPorKgProduto).toFixed(2));
      } else {
        newTratamentos[index].quantidadeTotal = 0;
        newTratamentos[index].custoTotal = 0;
      }
    }
    
    onChange(newTratamentos);
  };

  const handleRemove = (index: number) => {
    const newTratamentos = [...tratamentos];
    newTratamentos.splice(index, 1);
    onChange(newTratamentos);
  };

  const displayWeightValue = localWeightStr !== null
    ? localWeightStr
    : ((pesoAmostradoKg !== undefined && Number(pesoAmostradoKg) > 0)
        ? String(pesoAmostradoKg)
        : (savedTreatmentWeight
            ? String(savedTreatmentWeight)
            : (pesoEstimadoCurve > 0 ? pesoEstimadoCurve.toFixed(2) : '')));

  const activeMedicamentos: any[] = (medicamentosPermitidos && medicamentosPermitidos.length > 0) 
    ? medicamentosPermitidos 
    : DEFAULT_MEDICAMENTOS_PERMITIDOS;

  const activeCausas = (causasMortalidade && causasMortalidade.length > 0) 
    ? causasMortalidade 
    : DEFAULT_CAUSAS_MORTALIDADE;

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
            <div className="flex items-center gap-1">
              Peso est.: 
              <input 
                type="number" 
                step="0.01" 
                value={displayWeightValue}
                onChange={handleWeightChange}
                className="w-16 px-1 py-0.5 text-slate-700 font-semibold bg-white border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
              />
              kg
            </div>
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
                  <label className="block text-xs text-slate-500 mb-1">Princípio Ativo</label>
                  <select
                    value={tratamento.produto}
                    onChange={(e) => handleUpdate(index, 'produto', e.target.value)}
                    className="w-full border border-slate-200 rounded p-1.5 text-sm bg-white font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Selecione o Princípio Ativo...</option>
                    {activeMedicamentos.map(m => {
                      const name = typeof m === 'string' ? m : m.nome;
                      return <option key={name} value={name}>{name}</option>;
                    })}
                    {tratamento.produto && !activeMedicamentos.some(m => (typeof m === 'string' ? m : m.nome) === tratamento.produto) && (
                      <option value={tratamento.produto}>{tratamento.produto} (Outro)</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Motivo / Causa</label>
                  <select
                    value={tratamento.motivo || ''}
                    onChange={(e) => handleUpdate(index, 'motivo', e.target.value)}
                    className="w-full border border-slate-200 rounded p-1.5 text-sm bg-white font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Selecione o Motivo / Causa...</option>
                    {activeCausas.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    {tratamento.motivo && !activeCausas.includes(tratamento.motivo) && (
                      <option value={tratamento.motivo}>{tratamento.motivo} (Outro)</option>
                    )}
                  </select>
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
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Carência (Dias) <span className="text-[10px]">(Abate)</span></label>
                  <input
                    type="number"
                    value={tratamento.carenciaDias || ''}
                    onChange={(e) => handleUpdate(index, 'carenciaDias', parseInt(e.target.value))}
                    className="w-full border border-slate-200 rounded p-1.5 text-sm"
                    placeholder="Ex: 15"
                  />
                </div>
              </div>
              
              {tratamento.doseMgKg > 0 && tratamento.duracaoDias > 0 && (
                <div className="bg-blue-50 border border-blue-100 p-2 rounded text-xs text-blue-800 flex justify-between">
                  <div>
                    <span className="block text-blue-600/70">Quantidade (kg/dia):</span>
                    <span className="font-semibold text-sm">{tratamento.quantidadePorDia} kg</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-blue-600/70">Total Tratamento:</span>
                    <span className="font-semibold text-sm">{tratamento.quantidadeTotal} kg</span>
                  </div>
                  {tratamento.custoTotal > 0 && (
                  <div>
                    <span className="block text-blue-600/70">Custo Total:</span>
                    <span className="font-semibold text-sm">R$ {tratamento.custoTotal}</span>
                  </div>
                  )}
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
      <datalist id="medication-suggestions">
        {memory.map(m => (
          <option key={m.produto} value={m.produto} />
        ))}
      </datalist>
    </div>
  );
}
