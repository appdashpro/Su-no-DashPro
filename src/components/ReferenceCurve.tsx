import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Empresa, EmpresaConfig, CurveConfig, UserProfile } from '../types';
import { AlertCircle, Check } from 'lucide-react';

interface ReferenceCurveProps {
  currentUser?: UserProfile | null;
}

export function ReferenceCurve({ currentUser }: ReferenceCurveProps) {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
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
    fetchEmpresas();
  }, []);

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
      setEmpresas(data || []);
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

      if (data) {
        setConfig(data);
        if (data.curva_desempenho && Array.isArray(data.curva_desempenho)) {
           // filter out legacy arrays if they exist, or map them
           if (data.curva_desempenho.length > 0 && 'dia' in data.curva_desempenho[0]) {
              setCurvas([{
                 id: 'legacy-migrated',
                 nome: 'Curva Legada',
                 dataVigencia: '2000-01-01',
                 tipoLote: 'Misto',
                 tipoCalculo: data.tipo_calculo_curva || 'DIA_UM',
                 metaMortalidade: data.meta_mortalidade || 0,
                 curve: data.curva_desempenho,
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
              setCurvas(data.curva_desempenho);
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
      setSelectedCurvaId(curvas[0].id);
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
    let baseName = groupCurves[0].nome;
    
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gerenciar Curvas de Consumo</h1>
          <p className="text-slate-500 mt-1">Ajuste os valores diários de consumo e ganho de peso para a versão selecionada.</p>
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
            {empresas.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.nome}</option>
            ))}
          </select>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <label className="block text-sm font-semibold text-slate-700 mb-3">Versão da Curva (Visualização)</label>
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
                  <option key={g.key} value={g.key}>{g.nome} ({new Date(g.dataVigencia + 'T12:00:00').toLocaleDateString('pt-BR')})</option>
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
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider p-3 bg-slate-50 border-b border-slate-200">
              Metas de Fases (Programas Alimentares)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-center text-sm text-slate-600">
                <thead className="bg-[#2D452B] text-white font-medium border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2 text-xs">Aloj (kg)</th>
                    <th className="px-3 py-2 text-xs">C1 (kg)</th>
                    <th className="px-3 py-2 text-xs">C2 (kg)</th>
                    <th className="px-3 py-2 text-xs">C3 (kg)</th>
                    <th className="px-3 py-2 text-xs">T1 (kg)</th>
                    <th className="px-3 py-2 text-xs">T2 (kg)</th>
                    <th className="px-3 py-2 text-xs bg-[#1A3A5B]">Total (kg)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold bg-white">
                  <tr>
                    <td className="px-3 py-2">{editableMetas.metaAlojamento.toFixed(2)}</td>
                    <td className="px-3 py-2">{editableMetas.metaCrescimento1.toFixed(2)}</td>
                    <td className="px-3 py-2">{editableMetas.metaCrescimento2.toFixed(2)}</td>
                    <td className="px-3 py-2">{editableMetas.metaCrescimento3.toFixed(2)}</td>
                    <td className="px-3 py-2">{editableMetas.metaTerminacao1.toFixed(2)}</td>
                    <td className="px-3 py-2">{editableMetas.metaTerminacao2.toFixed(2)}</td>
                    <td className="px-3 py-2 font-bold bg-[#1A3A5B] text-white">
                      {editableMetas.metaAcumulada.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 120 Days Curve Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <span>Valores Diários ({editableCurve.length} dias)</span>
              <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded">Visualização Bloqueada</span>
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
                      <td className="px-3 py-1 text-slate-500">{row.pesoInicial.toFixed(2)}</td>
                      <td className="px-3 py-1 text-slate-500 font-medium">{row.pesoFinal.toFixed(2)}</td>
                      <td className="px-3 py-1 border-x border-slate-100 font-medium text-emerald-700">{row.gpd.toFixed(3)}</td>
                      <td className="px-3 py-1 border-x border-slate-100 font-medium text-emerald-700">{row.cmd.toFixed(3)}</td>
                      <td className="px-3 py-1 font-medium text-blue-600">{row.consumoAcumulado.toFixed(2)}</td>
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
