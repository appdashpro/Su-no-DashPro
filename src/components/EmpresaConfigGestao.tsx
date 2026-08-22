import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Empresa, EmpresaConfig, UserProfile, CurveConfig } from '../types';
import { Save, AlertCircle, Plus, Trash2, Settings, X, RotateCcw } from 'lucide-react';
import { DEFAULT_MEDICAMENTOS_PERMITIDOS, DEFAULT_CAUSAS_MORTALIDADE, growthCurvesMisto, growthCurveFemea, defaultMetas, defaultMetasFemea } from '../data';

interface EmpresaConfigGestaoProps {
  currentUser: UserProfile | null;
}

export function EmpresaConfigGestao({ currentUser }: EmpresaConfigGestaoProps) {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
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

  const [newMedicamento, setNewMedicamento] = useState('');
  const [newCausa, setNewCausa] = useState('');
      
  useEffect(() => {
    fetchEmpresas();
  }, []);

  useEffect(() => {
    if (selectedEmpresaId) {
      fetchConfig(selectedEmpresaId);
    } else {
      setConfig(null);
    }
  }, [selectedEmpresaId]);

  const fetchEmpresas = async () => {
    setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from('empresas')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (err) throw err;
      setEmpresas(data || []);
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

      if (data) {
        setConfig(data);
        setTipoCalculo(data.tipo_calculo_curva || 'DIA_UM');
        setMetaMortalidade(data.meta_mortalidade || 0);
        setMedicamentos((data.medicamentos_permitidos && data.medicamentos_permitidos.length > 0) ? data.medicamentos_permitidos : DEFAULT_MEDICAMENTOS_PERMITIDOS);
        setCausas((data.causas_mortalidade && data.causas_mortalidade.length > 0) ? data.causas_mortalidade : DEFAULT_CAUSAS_MORTALIDADE);
        

      } else {
        setConfig(null);
        setTipoCalculo('DIA_UM');
        setMetaMortalidade(0);
        setMedicamentos(DEFAULT_MEDICAMENTOS_PERMITIDOS);
        setCausas(DEFAULT_CAUSAS_MORTALIDADE);
        
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

  if (!currentUser || !['MASTER', 'SUPER_ADMIN'].includes(currentUser.papel)) {
    return (
      <div className="p-8 text-center text-red-500 bg-red-50/50 rounded-xl m-4 border border-red-100">
        Você não tem permissão para acessar esta área.
      </div>
    );
  }

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
          <label className="block text-sm font-semibold text-slate-700 mb-2">Selecione o Cliente</label>
          <select
            value={selectedEmpresaId}
            onChange={(e) => setSelectedEmpresaId(e.target.value)}
            className="w-full sm:w-96 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          >
            {empresas.map(emp => (
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
                        <button onClick={() => removeMedicamento(med)} className="hover:text-red-500 ml-1 text-slate-400">
                          <X className="w-3 h-3" />
                        </button>
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
                        <button onClick={() => removeCausa(causa)} className="hover:text-red-500 ml-1 text-slate-400">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {causas.length === 0 && <span className="text-sm text-slate-400 italic">Nenhuma causa na lista.</span>}
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
