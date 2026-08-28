import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Empresa, EmpresaConfig, UserProfile, CurveConfig } from '../types';
import { Save, AlertCircle, Plus, Trash2, Settings, X, RotateCcw, Check } from 'lucide-react';
import { defaultPastreProgramaAlimentar, defaultBugioProgramaAlimentar, DEFAULT_MEDICAMENTOS_PERMITIDOS, DEFAULT_CAUSAS_MORTALIDADE, DEFAULT_TECNICOS, growthCurvesMisto, growthCurveFemea, defaultMetas, defaultMetasFemea } from '../data';
import { getEmpresaConfigsLocal } from '../lib/storage';

interface EmpresaConfigGestaoProps {
  currentUser: UserProfile | null;
  empresas?: Empresa[];
}

export function EmpresaConfigGestao({ currentUser, empresas = [] }: EmpresaConfigGestaoProps) {
  const [empresasList, setEmpresasList] = useState<Empresa[]>([]);
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string>('');
  const [config, setConfig] = useState<EmpresaConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Local state for simple fields
  const [tipoCalculo, setTipoCalculo] = useState<'DIA_UM' | 'PESO_ALOJAMENTO'>('DIA_UM');
  const [metaMortalidade, setMetaMortalidade] = useState<number>(0);
  const [medicamentos, setMedicamentos] = useState<string[]>([]);
  const [causas, setCausas] = useState<string[]>([]);
  const [tecnicos, setTecnicos] = useState<string[]>([]);
  const [newTecnico, setNewTecnico] = useState('');

  const [newMedicamento, setNewMedicamento] = useState('');
  const [newCausa, setNewCausa] = useState('');
      
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
    }
  }, [selectedEmpresaId]);

  const isDirty = React.useMemo(() => {
    if (!selectedEmpresaId) return false;
    
    // Default fallback calculation if config doesn't exist
    const emp = empresasList.length > 0 ? empresasList.find(e => e.id === selectedEmpresaId) : empresas.find(e => e.id === selectedEmpresaId);
    const isPastre = emp?.nome ? emp.nome.toLowerCase().includes('pastre') : false;

    const baseTipoCalculo = config?.tipo_calculo_curva || 'DIA_UM';
    const baseMetaMortalidade = config?.meta_mortalidade || 0;
    const baseMedicamentos = (config?.medicamentos_permitidos && config.medicamentos_permitidos.length > 0) ? config.medicamentos_permitidos : DEFAULT_MEDICAMENTOS_PERMITIDOS;
    const baseCausas = (config?.causas_mortalidade && config.causas_mortalidade.length > 0) ? config.causas_mortalidade : DEFAULT_CAUSAS_MORTALIDADE;
    const baseTecnicos = (config?.tecnicos !== undefined && config.tecnicos !== null) ? config.tecnicos : (isPastre ? DEFAULT_TECNICOS : []);

    const arraysEqual = (a, b) => {
      if (a.length !== b.length) return false;
      const sortedA = [...a].sort();
      const sortedB = [...b].sort();
      return sortedA.every((val, index) => val === sortedB[index]);
    };

    return tipoCalculo !== baseTipoCalculo || 
           metaMortalidade !== baseMetaMortalidade ||
           !arraysEqual(medicamentos, baseMedicamentos) ||
           !arraysEqual(causas, baseCausas) ||
           !arraysEqual(tecnicos, baseTecnicos);

  }, [config, selectedEmpresaId, tipoCalculo, metaMortalidade, medicamentos, causas, tecnicos, empresasList, empresas]);

  const fetchEmpresas = async () => {
    setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from('empresas')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (err) throw err;
      setEmpresasList(data || []);
      if (data && data.length > 0) {
        setSelectedEmpresaId(data[0].id);
      }
    } catch (err: any) {
      console.error(err);
      setError('Erro ao carregar empresas.');
    } finally {
      setLoading(false);
    }
  };

  const fetchConfig = async (empresaId: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const { data, error: err } = await supabase
        .from('empresa_configuracoes')
        .select('*')
        .eq('empresa_id', empresaId)
        .single();

      if (err && err.code !== 'PGRST116') { // PGRST116 is "no rows returned", which is fine if config doesn't exist yet
        throw err;
      }

      const localConfigs = getEmpresaConfigsLocal();
      const localCfg = localConfigs.find((c: any) => c.empresa_id === empresaId);
      let activeData = data || localCfg;
      
      if (data && localCfg) {
         if (empresaId === '00000000-0000-0000-0000-000000000003') {
             activeData = { 
                ...data, 
                curva_desempenho: localCfg.curva_desempenho,
                programa_alimentar: localCfg.programa_alimentar
             };
         }
      }

      if (activeData) {
        if (empresaId === '00000000-0000-0000-0000-000000000001') {
           activeData.programa_alimentar = defaultPastreProgramaAlimentar;
        } else if (empresaId === '00000000-0000-0000-0000-000000000002') {
           activeData.programa_alimentar = defaultBugioProgramaAlimentar;
        } else if (!activeData.programa_alimentar || activeData.programa_alimentar.length === 0) {
           activeData.programa_alimentar = defaultPastreProgramaAlimentar;
        }
        setConfig(activeData);
        setTipoCalculo(activeData.tipo_calculo_curva || 'DIA_UM');
        setMetaMortalidade(activeData.meta_mortalidade || 0);
        setMedicamentos((activeData.medicamentos_permitidos && activeData.medicamentos_permitidos.length > 0) ? activeData.medicamentos_permitidos : DEFAULT_MEDICAMENTOS_PERMITIDOS);
        setCausas((activeData.causas_mortalidade && activeData.causas_mortalidade.length > 0) ? activeData.causas_mortalidade : DEFAULT_CAUSAS_MORTALIDADE);
        
        const emp = empresasList.length > 0 ? empresasList.find(e => e.id === selectedEmpresaId) : empresas.find(e => e.id === selectedEmpresaId);
        const isPastre = emp?.nome ? emp.nome.toLowerCase().includes('pastre') : false;
        setTecnicos((activeData.tecnicos !== undefined && activeData.tecnicos !== null) ? activeData.tecnicos : (isPastre ? DEFAULT_TECNICOS : []));
  
        
      } else {
        setConfig(null);
        setTipoCalculo('DIA_UM');
        setMetaMortalidade(0);
        setMedicamentos(DEFAULT_MEDICAMENTOS_PERMITIDOS);
        setCausas(DEFAULT_CAUSAS_MORTALIDADE);
        
        const emp = empresasList.length > 0 ? empresasList.find(e => e.id === selectedEmpresaId) : empresas.find(e => e.id === selectedEmpresaId);
        const isPastre = emp?.nome ? emp.nome.toLowerCase().includes('pastre') : false;
        setTecnicos(isPastre ? DEFAULT_TECNICOS : []);
  
        
      }
    } catch (err: any) {
      console.error(err);
      setError('Erro ao carregar configurações.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedEmpresaId) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    const payload: Partial<EmpresaConfig> = {
      empresa_id: selectedEmpresaId,
      tipo_calculo_curva: tipoCalculo,
      meta_mortalidade: metaMortalidade,
      medicamentos_permitidos: medicamentos,
      causas_mortalidade: causas,
      tecnicos: tecnicos,
      // If config exists, preserve its JSON fields, otherwise default
      curva_desempenho: config?.curva_desempenho || [],
      programa_alimentar: config?.programa_alimentar || []
    };

    try {
      const { error: err } = await supabase
        .from('empresa_configuracoes')
        .upsert(payload, { onConflict: 'empresa_id' });

      if (err) throw err;
      setSuccess('Configurações salvas com sucesso!');
      await fetchConfig(selectedEmpresaId);
    } catch (err: any) {
      console.error(err);
      setError('Erro ao salvar configurações.');
    } finally {
      setSaving(false);
    }
  };

  const addMedicamento = () => {
    if (newMedicamento.trim() && !medicamentos.includes(newMedicamento.trim())) {
      setMedicamentos([...medicamentos, newMedicamento.trim()]);
      setNewMedicamento('');
    }
  };

  const removeMedicamento = (med: string) => {
    setMedicamentos(medicamentos.filter(m => m !== med));
  };

  const addCausa = () => {
    if (newCausa.trim() && !causas.includes(newCausa.trim())) {
      setCausas([...causas, newCausa.trim()]);
      setNewCausa('');
    }
  };

  const removeCausa = (c: string) => {
    setCausas(causas.filter(causa => causa !== c));
  };

  const addTecnico = () => {
    if (newTecnico.trim() && !tecnicos.includes(newTecnico.trim())) {
      setTecnicos([...tecnicos, newTecnico.trim()]);
      setNewTecnico('');
    }
  };

  const removeTecnico = (tecnico: string) => {
    setTecnicos(prev => prev.filter(t => t !== tecnico));
  };

  if (!currentUser) return null;
  const isMaster = ['MASTER', 'SUPER_ADMIN'].includes(currentUser.papel);

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Settings className="w-6 h-6 text-emerald-600" />
            Parâmetros por Cliente
          </h1>
          <p className="text-slate-500 mt-1">Configure regras de negócio, medicamentos e cálculos específicos por empresa.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-semibold text-slate-700">Selecione o Cliente</label>
            {selectedEmpresaId && (
              isDirty ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                  <AlertCircle className="w-3.5 h-3.5" /> Alterações não salvas
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <Check className="w-3.5 h-3.5" /> Configuração Em Utilização (Base de Cálculo)
                </span>
              )
            )}
          </div>
          <select
            value={selectedEmpresaId}
            onChange={(e) => setSelectedEmpresaId(e.target.value)}
            disabled={!isMaster && empresasList.length <= 1}
            className="w-full sm:w-96 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          >
            {empresasList.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.nome}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">Carregando parâmetros...</div>
        ) : (
          <div className="p-6 space-y-8">
            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}
            {success && (
              <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {success}
              </div>
            )}

            <div className="space-y-8">
              {/* Ajustes e Metas */}
              <div className="bg-slate-50/50 p-6 rounded-xl border border-slate-200/80">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Lógica e Metas</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Tipo de Cálculo da Curva
                    </label>
                    <select
                      value={tipoCalculo}
                      onChange={(e) => setTipoCalculo(e.target.value as 'DIA_UM' | 'PESO_ALOJAMENTO')}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="DIA_UM">Cronológico Padrão (Inicia no Dia 1)</option>
                      <option value="PESO_ALOJAMENTO">Deslocamento Inteligente (Pelo Peso de Alojamento)</option>
                    </select>
                    <p className="text-xs text-slate-500 mt-1">
                      Define como o aplicativo exigirá metas de consumo e peso para os lotes deste cliente.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Meta de Mortalidade (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={metaMortalidade}
                      onChange={(e) => setMetaMortalidade(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </div>


              {/* Listas Permitidas */}
              <div className="bg-slate-50/50 p-6 rounded-xl border border-slate-200/80">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Listas Permitidas</h3>
                
                {/* Medicamentos */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Medicamentos / Princípios Ativos Permitidos ({medicamentos.length})
                    </label>
                    <button
                      type="button"
                      onClick={() => setMedicamentos([...DEFAULT_MEDICAMENTOS_PERMITIDOS])}
                  disabled={!isMaster}
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded border border-emerald-200"
                    >
                      <RotateCcw className="w-3 h-3" /> Restaurar Lista Padrão
                    </button>
                  </div>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newMedicamento}
                      onChange={(e) => setNewMedicamento(e.target.value)}
                      disabled={!isMaster}
                      onKeyDown={(e) => e.key === 'Enter' && addMedicamento()}
                      placeholder="Nome do princípio ativo / medicamento"
                      className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <button
                      onClick={addMedicamento}
                      className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-2 bg-white rounded-lg border border-slate-200">
                    {medicamentos.map(med => (
                      <span key={med} className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-medium border border-emerald-200 shadow-sm">
                        {med}
                        {isMaster && (<button onClick={() => removeMedicamento(med)} className="hover:text-red-500 ml-1 text-slate-400">
                          <X className="w-3 h-3" />
                        </button>)}
                      </span>
                    ))}
                    {medicamentos.length === 0 && <span className="text-sm text-slate-400 italic">Nenhum medicamento na lista.</span>}
                  </div>
                </div>

                {/* Causas de Mortalidade */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Causas de Mortalidade / Motivos ({causas.length})
                    </label>
                    <button
                      type="button"
                      onClick={() => setCausas([...DEFAULT_CAUSAS_MORTALIDADE])}
                  disabled={!isMaster}
                      className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 bg-orange-50 px-2 py-1 rounded border border-orange-200"
                    >
                      <RotateCcw className="w-3 h-3" /> Restaurar Lista Padrão
                    </button>
                  </div>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newCausa}
                      onChange={(e) => setNewCausa(e.target.value)}
                      disabled={!isMaster}
                      onKeyDown={(e) => e.key === 'Enter' && addCausa()}
                      placeholder="Ex: Pneumonia / doença respiratória"
                      className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <button
                      onClick={addCausa}
                      className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-2 bg-white rounded-lg border border-slate-200">
                    {causas.map(causa => (
                      <span key={causa} className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-800 rounded-full text-xs font-medium border border-orange-200 shadow-sm">
                        {causa}
                        {isMaster && (<button onClick={() => removeCausa(causa)} className="hover:text-red-500 ml-1 text-slate-400">
                          <X className="w-3 h-3" />
                        </button>)}
                      </span>
                    ))}
                    {causas.length === 0 && <span className="text-sm text-slate-400 italic">Nenhuma causa na lista.</span>}
                  </div>
                </div>
              </div>
            </div>

              <div className="pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-700">Técnicos / Colaboradores</h3>
                  <p className="text-xs text-slate-500">Nomes disponíveis para seleção nos lançamentos de visita.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setTecnicos([...DEFAULT_TECNICOS])}
                  className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                >
                  Restaurar Padrões
                </button>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="md:w-1/3">
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newTecnico}
                      onChange={e => setNewTecnico(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTecnico())}
                      placeholder="Novo técnico..."
                      className="flex-1 border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={addTecnico}
                      disabled={!isMaster || !newTecnico.trim()}
                      className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-colors border border-slate-200"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="md:w-2/3">
                  <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-2 bg-white rounded-lg border border-slate-200">
                    {tecnicos.map(tecnico => (
                      <span key={tecnico} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-xs font-medium border border-blue-200 shadow-sm">
                        {tecnico}
                        {isMaster && (<button onClick={() => removeTecnico(tecnico)} className="hover:text-red-500 ml-1 text-slate-400">
                          <X className="w-3 h-3" />
                        </button>)}
                      </span>
                    ))}
                    {tecnicos.length === 0 && <span className="text-sm text-slate-400 italic">Nenhum técnico na lista.</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving || !selectedEmpresaId}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {saving ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {saving ? 'Salvando...' : 'Salvar Alterações do Cliente'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
