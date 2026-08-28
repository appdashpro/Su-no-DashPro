import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Empresa, EmpresaConfig, CurveConfig, UserProfile } from '../types';
import { AlertCircle, Check, Save, Edit2, X } from 'lucide-react';
import { getEmpresaConfigsLocal } from '../lib/storage';
import { growthCurvesMisto, defaultPastreProgramaAlimentar, defaultBugioProgramaAlimentar, defaultBtzProgramaAlimentar } from '../data';

interface ReferenceCurveProps {
  currentUser?: UserProfile | null;
  empresas?: Empresa[];
}

export function ReferenceCurve({ currentUser, empresas = [] }: ReferenceCurveProps) {
  const [empresasList, setEmpresasList] = useState<Empresa[]>([]);
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string>('');
  
  const [config, setConfig] = useState<EmpresaConfig | null>(null);
  const [curvas, setCurvas] = useState<CurveConfig[]>([]);
  const [selectedCurvaId, setSelectedCurvaId] = useState<string>('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editableCurve, setEditableCurve] = useState<any[]>([]);
  
  const [editableMetas, setEditableMetas] = useState<any>(null);

  useEffect(() => {
    if (empresas && empresas.length > 0) {
      setEmpresasList(empresas);
      if (!selectedEmpresaId) setSelectedEmpresaId(empresas[0].id);
    } else {
      fetchEmpresas();
    }
  }, [empresas]);

  useEffect(() => {
    if (selectedEmpresaId) {
      fetchConfig(selectedEmpresaId);
    } else {
      setConfig(null);
      setCurvas([]);
      setSelectedCurvaId('');
    }
  }, [selectedEmpresaId]);

  useEffect(() => {
    if (selectedCurvaId && curvas.length > 0) {
      const cv = curvas.find(c => c.id === selectedCurvaId);
      if (cv) {
        setEditableCurve(JSON.parse(JSON.stringify(cv.curve)));
        setEditableMetas(JSON.parse(JSON.stringify(cv.metas)));
      }
    } else {
      setEditableCurve([]);
      setEditableMetas(null);
    }
  }, [selectedCurvaId, curvas]);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleCancel = () => {
    const cv = curvas.find(c => c.id === selectedCurvaId);
    if (cv) {
      setEditableCurve(JSON.parse(JSON.stringify(cv.curve)));
      setEditableMetas(JSON.parse(JSON.stringify(cv.metas)));
    }
    setIsEditing(false);
  };

  const handleMetaChange = (phaseKey: string, newValueStr: string) => {
    const val = parseFloat(newValueStr);
    
    setEditableMetas((prev: any) => {
      if (!prev) return prev;
      const updated = { ...prev, [phaseKey]: isNaN(val) ? 0 : val };
      updated.metaAcumulada = (
        updated.metaAlojamento + 
        updated.metaCrescimento1 + 
        updated.metaCrescimento2 + 
        updated.metaCrescimento3 + 
        updated.metaTerminacao1 + 
        updated.metaTerminacao2
      );
      return updated;
    });

    if (isNaN(val)) return;

    const phaseNames: Record<string, string> = {
      metaAlojamento: 'Alojamento',
      metaCrescimento1: 'Crescimento 1',
      metaCrescimento2: 'Crescimento 2',
      metaCrescimento3: 'Crescimento 3',
      metaTerminacao1: 'Terminação 1',
      metaTerminacao2: 'Terminação 2'
    };
    
    const phaseName = phaseNames[phaseKey];
    if (phaseName && config?.programa_alimentar) {
      const prog = config.programa_alimentar.find((p: any) => (p.nome && p.nome.toLowerCase() === phaseName.toLowerCase()) || (p.racao && p.racao.toLowerCase() === phaseName.toLowerCase()));
      if (prog) {
         // To avoid shape collapse on 0, we only apply proportional changes if oldMeta is > 0 and val > 0.
         // If a user types 0, it becomes 0. If they type a number after, they must cancel to restore the curve shape.
         const oldMeta = editableMetas[phaseKey];
         if (oldMeta > 0 && val >= 0) {
            const ratio = val / oldMeta;
            setEditableCurve((prevCurve: any[]) => {
               const newCurve = [...prevCurve];
               let currentAcumulado = 0;
               for (let i = 0; i < newCurve.length; i++) {
                  const day = newCurve[i].dia;
                  if (day >= prog.dia_inicio && day <= prog.dia_fim) {
                     newCurve[i] = { ...newCurve[i], cmd: newCurve[i].cmd * ratio };
                  }
                  currentAcumulado += newCurve[i].cmd;
                  newCurve[i] = { ...newCurve[i], consumoAcumulado: currentAcumulado };
               }
               return newCurve;
            });
         }
      }
    }
  };

  const handleSave = async () => {
    if (!config || !selectedCurvaId) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    const updatedCurvas = curvas.map(c => {
      if (c.id === selectedCurvaId) {
        return {
          ...c,
          metas: editableMetas,
          curve: editableCurve,
          last_modified_by: currentUser?.nome || currentUser?.email || 'Usuário Desconhecido',
          last_modified_at: new Date().toISOString()
        };
      }
      return c;
    });

    const payload = {
      empresa_id: config.empresa_id,
      curva_desempenho: updatedCurvas,
      tipo_calculo_curva: config.tipo_calculo_curva,
      meta_mortalidade: config.meta_mortalidade,
      medicamentos_permitidos: config.medicamentos_permitidos,
      causas_mortalidade: config.causas_mortalidade,
      tecnicos: config.tecnicos,
      programa_alimentar: config.programa_alimentar
    };

    try {
      const { error: err } = await supabase
        .from('empresa_configuracoes')
        .upsert(payload, { onConflict: 'empresa_id' });

      if (err) throw err;
      
      setSuccess('Curva atualizada com sucesso!');
      setCurvas(updatedCurvas);
      setIsEditing(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch(err) {
       console.error(err);
       setError('Erro ao salvar as metas.');
    } finally {
       setSaving(false);
    }
  };

  const fetchEmpresas = async () => {
    try {
      let query = supabase.from('empresas').select('*').eq('ativo', true).order('nome');
      if (currentUser && !['MASTER', 'SUPER_ADMIN'].includes(currentUser.papel)) {
        if (currentUser.empresa_id) {
          query = query.eq('id', currentUser.empresa_id);
        }
      }
      const { data, error: err } = await query;
      if (err) throw err;
      setEmpresasList(data || []);
      if (data && data.length > 0) setSelectedEmpresaId(data[0].id);
    } catch (err: any) {
      console.error(err);
    }
  };

  const fetchConfig = async (empId: string) => {
    setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from('empresa_configuracoes')
        .select('*')
        .eq('empresa_id', empId)
        .single();
      
      if (err && err.code !== 'PGRST116') throw err;

      // Also check local config (which includes hardcoded ones like Mugnol)
      const localConfigs = getEmpresaConfigsLocal();
      const localCfg = localConfigs.find((c: any) => c.empresa_id === empId);

      // We merge or prefer local config if there's no data in supabase
      let activeData = data || localCfg;
      
      if (data && localCfg) {
         if (!data.curva_desempenho || data.curva_desempenho.length === 0 || empId === '00000000-0000-0000-0000-000000000003') {
            activeData = { ...data, curva_desempenho: localCfg.curva_desempenho };
         }
      }

      if (activeData) {
        // --- PROGRAMA ALIMENTAR PASTRE HOTFIX ---
        if (empId === '00000000-0000-0000-0000-000000000001') {
           activeData.programa_alimentar = defaultPastreProgramaAlimentar;
        } else if (empId === '00000000-0000-0000-0000-000000000002') {
           activeData.programa_alimentar = defaultBugioProgramaAlimentar;
        } else if (empresas.find(e => e.id === empId)?.nome.toLowerCase().includes('btz')) {
           if (!activeData.programa_alimentar || activeData.programa_alimentar.length === 0) {
             activeData.programa_alimentar = defaultBtzProgramaAlimentar;
           }
        }

        // --- V2 HOTFIX FOR PASTRE ---
        if (activeData.curva_desempenho && Array.isArray(activeData.curva_desempenho)) {
           const v2Index = activeData.curva_desempenho.findIndex((c: any) => c.version === 'v2' || (c.nome && c.nome.toLowerCase().includes('v2')));
           if (v2Index !== -1) {
             // Force overwrite curve and metas with the official V2 from source code
             const officialV2 = growthCurvesMisto.find(c => c.version === 'v2');
             if (officialV2) {
               activeData.curva_desempenho[v2Index].curve = officialV2.curve;
               activeData.curva_desempenho[v2Index].metas = officialV2.metas;
             }
           }
        }
        // -----------------------------
        // --- BUGIO HOTFIX ---
        if (empId === '00000000-0000-0000-0000-000000000002') {
            if (!activeData.curva_desempenho || activeData.curva_desempenho.length === 0 || !activeData.curva_desempenho.find((c: any) => c.version === 'bugio' || (c.nome && c.nome.toLowerCase().includes('bugio')))) {
               const officialBugio = growthCurvesMisto.find(c => c.version === 'bugio');
               if (officialBugio) {
                   activeData.curva_desempenho = activeData.curva_desempenho || [];
                   activeData.curva_desempenho.push({
                       id: 'bugio-curve',
                       nome: 'Curva Bugio',
                       dataVigencia: officialBugio.effectiveDate,
                       tipoLote: 'Misto',
                       version: 'bugio',
                       tipoCalculo: 'DIA_UM',
                       metaMortalidade: activeData.meta_mortalidade || 0,
                       curve: officialBugio.curve,
                       metas: officialBugio.metas
                   });
               }
            } else {
               const bugioIndex = activeData.curva_desempenho.findIndex((c: any) => c.version === 'bugio' || (c.nome && c.nome.toLowerCase().includes('bugio')));
               const officialBugio = growthCurvesMisto.find(c => c.version === 'bugio');
               if (officialBugio) {
                   activeData.curva_desempenho[bugioIndex].curve = officialBugio.curve;
                   activeData.curva_desempenho[bugioIndex].metas = officialBugio.metas;
               }
            }
        }
        // --- BTZ HOTFIX ---
        if (empresas.find(e => e.id === empId)?.nome.toLowerCase().includes('btz')) {
            if (!activeData.curva_desempenho || activeData.curva_desempenho.length === 0 || !activeData.curva_desempenho.find((c: any) => c.version === 'btz' || (c.nome && c.nome.toLowerCase().includes('btz')))) {
               const officialBtz = growthCurvesMisto.find(c => c.version === 'btz');
               if (officialBtz) {
                   activeData.curva_desempenho = activeData.curva_desempenho || [];
                   activeData.curva_desempenho.push({
                       id: 'btz-curve',
                       nome: 'Curva Grupo BTZ',
                       dataVigencia: officialBtz.effectiveDate,
                       tipoLote: 'Misto',
                       version: 'btz',
                       tipoCalculo: 'DIA_UM',
                       metaMortalidade: activeData.meta_mortalidade || 0,
                       curve: officialBtz.curve,
                       metas: officialBtz.metas
                   });
               }
            } else {
               const btzIndex = activeData.curva_desempenho.findIndex((c: any) => c.version === 'btz' || (c.nome && c.nome.toLowerCase().includes('btz')));
               const officialBtz = growthCurvesMisto.find(c => c.version === 'btz');
               if (officialBtz) {
                   activeData.curva_desempenho[btzIndex].curve = officialBtz.curve;
                   activeData.curva_desempenho[btzIndex].metas = officialBtz.metas;
               }
            }
        }

        setConfig(activeData);
        if (activeData.curva_desempenho && Array.isArray(activeData.curva_desempenho)) {
           // filter out legacy arrays if they exist, or map them
           if (activeData.curva_desempenho.length > 0 && 'dia' in activeData.curva_desempenho[0]) {
              setCurvas([{
                 id: 'legacy-migrated',
                 nome: 'Curva Legada',
                 dataVigencia: '2000-01-01',
                 tipoLote: 'Misto',
                 tipoCalculo: activeData.tipo_calculo_curva || 'DIA_UM',
                 metaMortalidade: activeData.meta_mortalidade || 0,
                 curve: activeData.curva_desempenho,
                 metas: {
                   metaAlojamento: 16.39,
                   metaCrescimento1: 22.97,
                   metaCrescimento2: 29.45,
                   metaCrescimento3: 34.04,
                   metaTerminacao1: 25.98,
                   metaTerminacao2: 37.46,
                   metaAcumulada: 166.29
                 }
              }]);
           } else {
              setCurvas(activeData.curva_desempenho);
           }
        } else {
          setCurvas([]);
        }
      } else {
        setConfig(null);
        setCurvas([]);
      }
    } catch (err: any) {
      console.error(err);
      setError('Erro ao carregar.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (curvas.length > 0 && !selectedCurvaId) {
      const today = new Date().toISOString().split('T')[0];
      const validCurves = [...curvas]
        .filter(c => c.dataVigencia <= today)
        .sort((a, b) => b.dataVigencia.localeCompare(a.dataVigencia));
      
      if (validCurves.length > 0) {
        setSelectedCurvaId(validCurves[0].id);
      } else {
        setSelectedCurvaId(curvas[0].id);
      }
    }
  }, [curvas]);

;

;

;


  const currentCurva = curvas.find(c => c.id === selectedCurvaId);
  const currentGroupKey = currentCurva ? currentCurva.dataVigencia : '';
  
  const uniqueGroups = Array.from(new Set(curvas.map(c => c.dataVigencia))).map(dataVigencia => {
    const groupCurves = curvas.filter(c => c.dataVigencia === dataVigencia);
    // Try to find a name that doesn't just describe the sex, or strip it
    let baseName = groupCurves[0].nome || 'Curva Padrão';
    
    // Simple heuristic: if name contains Misto, Macho, Femea, strip it
    const cleanName = baseName
      .replace(/\s*-\s*(misto|macho|fêmea|femea)/i, '')
      .replace(/\s+(misto|macho|fêmea|femea)/i, '')
      .replace(/\s*\(.*?\)/g, '') // remove parens just in case
      .trim();
      
    // If we stripped everything, fallback to the original
    const finalName = cleanName || baseName;
    return { key: dataVigencia, nome: finalName, dataVigencia };
  });

  const availableSexesForGroup = currentGroupKey 
    ? curvas.filter(c => c.dataVigencia === currentGroupKey)
    : [];

  const selectedCurva = currentCurva;
  
  const todayDate = new Date().toISOString().split('T')[0];
  const activeDateKey = [...curvas].filter(c => c.dataVigencia <= todayDate).sort((a, b) => b.dataVigencia.localeCompare(a.dataVigencia))[0]?.dataVigencia;
  const isActiveGroup = currentGroupKey === activeDateKey;

  const getPhaseDuration = (phaseName: string) => {
    if (!config || !config.programa_alimentar) return '-';
    const prog = config.programa_alimentar.find((p: any) => (p.nome && p.nome.toLowerCase() === phaseName.toLowerCase()) || (p.racao && p.racao.toLowerCase() === phaseName.toLowerCase()));
    if (prog) {
      const dias = (Number(prog.dia_fim) - Number(prog.dia_inicio)) + 1;
      return `${dias}`;
    }
    return '-';
  };

  const getPhaseAge = (phaseName: string) => {
    if (!config || !config.programa_alimentar) return '-';
    const prog = config.programa_alimentar.find((p: any) => (p.nome && p.nome.toLowerCase() === phaseName.toLowerCase()) || (p.racao && p.racao.toLowerCase() === phaseName.toLowerCase()));
    if (prog) {
      return `${prog.dia_inicio} a ${prog.dia_fim}`;
    }
    return '-';
  };

  const getTotalDuration = () => {
    if (!config || !config.programa_alimentar) return '-';
    let total = 0;
    const phases = ['Alojamento', 'Crescimento 1', 'Crescimento 2', 'Crescimento 3', 'Terminação 1', 'Terminação 2'];
    phases.forEach(phase => {
      const prog = config.programa_alimentar.find((p: any) => (p.nome && p.nome.toLowerCase() === phase.toLowerCase()) || (p.racao && p.racao.toLowerCase() === phase.toLowerCase()));
      if (prog) {
        total += (Number(prog.dia_fim) - Number(prog.dia_inicio)) + 1;
      }
    });
    return total > 0 ? total : '-';
  };

  const getTotalAge = () => {
    if (!config || !config.programa_alimentar) return '-';
    let min = Infinity;
    let max = -Infinity;
    const phases = ['Alojamento', 'Crescimento 1', 'Crescimento 2', 'Crescimento 3', 'Terminação 1', 'Terminação 2'];
    let found = false;
    phases.forEach(phase => {
      const prog = config.programa_alimentar.find((p: any) => (p.nome && p.nome.toLowerCase() === phase.toLowerCase()) || (p.racao && p.racao.toLowerCase() === phase.toLowerCase()));
      if (prog) {
        if (prog.dia_inicio < min) min = prog.dia_inicio;
        if (prog.dia_fim > max) max = prog.dia_fim;
        found = true;
      }
    });
    return found ? `${min} a ${max}` : '-';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gerenciar Curvas de Consumo</h1>
          <p className="text-slate-500 mt-1">Ajuste os valores diários de consumo e ganho de peso. Os dados marcados como <strong>"Em Utilização"</strong> são a base de cálculo atual do app.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <label className="block text-sm font-semibold text-slate-700 mb-3">Cliente (Empresa)</label>
          <select
            value={selectedEmpresaId}
            onChange={(e) => setSelectedEmpresaId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#2D452B] outline-none transition-colors"
          >
            <option value="">Selecione...</option>
            {empresasList.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.nome}</option>
            ))}
          </select>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-semibold text-slate-700">Versão da Curva (Visualização)</label>
            {(isActiveGroup && !isEditing) ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                <Check className="w-3 h-3" /> Em Utilização Atual
              </span>
            ) : isEditing ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                <AlertCircle className="w-3 h-3" /> Alterações não salvas
              </span>
            ) : null}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Data / Versão</label>
              <select
                value={currentGroupKey}
                onChange={(e) => {
                  const newKey = e.target.value;
                  const matchingCurvas = curvas.filter(c => c.dataVigencia === newKey);
                  if (matchingCurvas.length > 0) {
                    // Try to preserve the currently selected sex if possible
                    const currentSex = currentCurva?.tipoLote;
                    const sameSexCurve = matchingCurvas.find(c => c.tipoLote === currentSex);
                    setSelectedCurvaId(sameSexCurve ? sameSexCurve.id : matchingCurvas[0].id);
                  }
                }}
                disabled={curvas.length === 0}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#2D452B] outline-none disabled:opacity-50 transition-colors text-sm"
              >
                {curvas.length === 0 ? <option value="">Nenhuma curva</option> : null}
                {uniqueGroups.map(g => (
                  <option key={g.key} value={g.key}>{g.nome} ({new Date(g.dataVigencia + 'T12:00:00').toLocaleDateString('pt-BR')}) {g.dataVigencia === activeDateKey ? (isEditing ? '(!)' : '✓ EM UTILIZAÇÃO') : ''}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Sexo dos Animais</label>
              <select
                value={currentCurva?.id || ''}
                onChange={(e) => setSelectedCurvaId(e.target.value)}
                disabled={availableSexesForGroup.length === 0}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#2D452B] outline-none disabled:opacity-50 transition-colors text-sm"
              >
                {availableSexesForGroup.length === 0 ? <option value="">-</option> : null}
                {availableSexesForGroup.map(c => (
                  <option key={c.id} value={c.id}>{c.tipoLote || 'Misto'}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

        

      {success && (
        <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 flex items-center gap-2">
          <Check className="w-5 h-5" />
          {success}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      
      {loading ? (

        <div className="text-center py-12 text-slate-500">Carregando dados...</div>
      ) : curvas.length === 0 && selectedEmpresaId ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-500">
          Este cliente não possui nenhuma versão de curva cadastrada.<br/>
          Entre em contato com o suporte para adicionar uma nova versão.
        </div>
      ) : editableMetas && editableCurve.length > 0 ? (
        <div className="space-y-6">
          {/* Metas/Phases Edit Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider p-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
              <div className="flex flex-col">
                <span>Metas de Fases (Programas Alimentares)</span>
                {curvas.find(c => c.id === selectedCurvaId)?.last_modified_by && (
                  <span className="text-[10px] text-slate-400 font-normal mt-0.5 normal-case tracking-normal">
                    Última alteração por: {curvas.find(c => c.id === selectedCurvaId)?.last_modified_by} em {new Date(curvas.find(c => c.id === selectedCurvaId)?.last_modified_at || '').toLocaleString('pt-BR')}
                  </span>
                )}
              </div>
              {isEditing ? (
                <div className="flex gap-2">
                  <button onClick={handleCancel} disabled={saving} className="flex items-center gap-1 px-3 py-1 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors">
                    <X className="w-4 h-4" /> Cancelar
                  </button>
                  <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors">
                    <Save className="w-4 h-4" /> {saving ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              ) : currentUser?.papel === 'MASTER' ? (
                <button onClick={() => setIsEditing(true)} className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors border border-blue-200">
                  <Edit2 className="w-4 h-4" /> Ajustar Metas e Curva
                </button>
              ) : null}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-center text-sm text-slate-600">
                <thead className="bg-[#2D452B] text-white font-medium border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2 text-xs text-left">Indicador</th>
                    <th className="px-3 py-2 text-xs">Alojamento</th>
                    <th className="px-3 py-2 text-xs">Cresc 1</th>
                    <th className="px-3 py-2 text-xs">Cresc 2</th>
                    <th className="px-3 py-2 text-xs">Cresc 3</th>
                    <th className="px-3 py-2 text-xs">Term 1</th>
                    <th className="px-3 py-2 text-xs">Term 2</th>
                    <th className="px-3 py-2 text-xs bg-[#1A3A5B]">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  <tr>
                    <td className="px-3 py-2 text-slate-700 font-semibold text-xs text-left border-r border-slate-100 bg-slate-50">Meta (kg)</td>
                    <td className="px-3 py-2 font-semibold">
                      {isEditing ? (
                        <input type="number" step="0.01" className="w-16 md:w-20 px-1 py-1 text-center border border-slate-300 rounded focus:ring-2 focus:ring-blue-500" value={editableMetas.metaAlojamento || ''} onChange={(e) => handleMetaChange('metaAlojamento', e.target.value)} />
                      ) : (editableMetas.metaAlojamento || 0).toFixed(2)}
                    </td>
                    <td className="px-3 py-2 font-semibold">
                      {isEditing ? (
                        <input type="number" step="0.01" className="w-16 md:w-20 px-1 py-1 text-center border border-slate-300 rounded focus:ring-2 focus:ring-blue-500" value={editableMetas.metaCrescimento1 || ''} onChange={(e) => handleMetaChange('metaCrescimento1', e.target.value)} />
                      ) : (editableMetas.metaCrescimento1 || 0).toFixed(2)}
                    </td>
                    <td className="px-3 py-2 font-semibold">
                      {isEditing ? (
                        <input type="number" step="0.01" className="w-16 md:w-20 px-1 py-1 text-center border border-slate-300 rounded focus:ring-2 focus:ring-blue-500" value={editableMetas.metaCrescimento2 || ''} onChange={(e) => handleMetaChange('metaCrescimento2', e.target.value)} />
                      ) : (editableMetas.metaCrescimento2 || 0).toFixed(2)}
                    </td>
                    <td className="px-3 py-2 font-semibold">
                      {isEditing ? (
                        <input type="number" step="0.01" className="w-16 md:w-20 px-1 py-1 text-center border border-slate-300 rounded focus:ring-2 focus:ring-blue-500" value={editableMetas.metaCrescimento3 || ''} onChange={(e) => handleMetaChange('metaCrescimento3', e.target.value)} />
                      ) : (editableMetas.metaCrescimento3 || 0).toFixed(2)}
                    </td>
                    <td className="px-3 py-2 font-semibold">
                      {isEditing ? (
                        <input type="number" step="0.01" className="w-16 md:w-20 px-1 py-1 text-center border border-slate-300 rounded focus:ring-2 focus:ring-blue-500" value={editableMetas.metaTerminacao1 || ''} onChange={(e) => handleMetaChange('metaTerminacao1', e.target.value)} />
                      ) : (editableMetas.metaTerminacao1 || 0).toFixed(2)}
                    </td>
                    <td className="px-3 py-2 font-semibold">
                      {isEditing ? (
                        <input type="number" step="0.01" className="w-16 md:w-20 px-1 py-1 text-center border border-slate-300 rounded focus:ring-2 focus:ring-blue-500" value={editableMetas.metaTerminacao2 || ''} onChange={(e) => handleMetaChange('metaTerminacao2', e.target.value)} />
                      ) : (editableMetas.metaTerminacao2 || 0).toFixed(2)}
                    </td>
                    <td className="px-3 py-2 font-bold bg-[#1A3A5B] text-white">
                      {(editableMetas.metaAcumulada || 0).toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-slate-700 font-semibold text-xs text-left border-r border-slate-100 bg-slate-50">Duração (dias)</td>
                    <td className="px-3 py-2 text-xs text-slate-500 bg-slate-50">{getPhaseDuration('Alojamento')}</td>
                    <td className="px-3 py-2 text-xs text-slate-500 bg-slate-50">{getPhaseDuration('Crescimento 1')}</td>
                    <td className="px-3 py-2 text-xs text-slate-500 bg-slate-50">{getPhaseDuration('Crescimento 2')}</td>
                    <td className="px-3 py-2 text-xs text-slate-500 bg-slate-50">{getPhaseDuration('Crescimento 3')}</td>
                    <td className="px-3 py-2 text-xs text-slate-500 bg-slate-50">{getPhaseDuration('Terminação 1')}</td>
                    <td className="px-3 py-2 text-xs text-slate-500 bg-slate-50">{getPhaseDuration('Terminação 2')}</td>
                    <td className="px-3 py-2 text-xs font-bold bg-[#1A3A5B] text-white">{getTotalDuration()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 120 Days Curve Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider p-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
              <div className="flex flex-col">
                <span>Valores Diários ({editableCurve.length} dias)</span>
                {curvas.find(c => c.id === selectedCurvaId)?.last_modified_by && (
                  <span className="text-[10px] text-slate-400 font-normal mt-0.5 normal-case tracking-normal">
                    Última alteração por: {curvas.find(c => c.id === selectedCurvaId)?.last_modified_by} em {new Date(curvas.find(c => c.id === selectedCurvaId)?.last_modified_at || '').toLocaleString('pt-BR')}
                  </span>
                )}
              </div>
              <span className={`text-xs font-normal px-2 py-1 rounded ${isEditing ? 'bg-blue-100 text-blue-700' : 'text-slate-500 bg-slate-100'}`}>
                {isEditing ? 'Visualização Calculada' : 'Visualização Bloqueada'}
              </span>
            </h2>
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-center text-sm text-slate-600 min-w-[600px] relative">
                <thead className="bg-slate-50 text-slate-700 font-medium border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-3 py-3 text-xs w-16">Dia</th>
                    <th className="px-3 py-3 text-xs bg-slate-100">Peso Inicial (kg)</th>
                    <th className="px-3 py-3 text-xs bg-slate-100">Peso Final (kg)</th>
                    <th className="px-3 py-3 text-xs border-x-2 border-emerald-100 text-emerald-800">GPD (Ganho Diário)</th>
                    <th className="px-3 py-3 text-xs border-x-2 border-emerald-100 text-emerald-800">CMD (Consumo Diário)</th>
                    <th className="px-3 py-3 text-xs bg-slate-100">Consumo Acumulado (kg)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {editableCurve.map((row, index) => (
                    <tr key={row.dia} className="hover:bg-slate-50">
                      <td className="px-3 py-1 font-semibold text-slate-800 bg-slate-50">{row.dia}</td>
                      <td className="px-3 py-1 text-slate-500">{(row.pesoInicial || 0).toFixed(2)}</td>
                      <td className="px-3 py-1 text-slate-500 font-medium">{(row.pesoFinal || 0).toFixed(2)}</td>
                      <td className="px-3 py-1 border-x border-slate-100 font-medium text-emerald-700">{(row.gpd || 0).toFixed(3)}</td>
                      <td className="px-3 py-1 border-x border-slate-100 font-medium text-emerald-700">{(row.cmd || 0).toFixed(3)}</td>
                      <td className="px-3 py-1 font-medium text-blue-600">{(row.consumoAcumulado || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
