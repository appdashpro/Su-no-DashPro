const fs = require('fs');
const path = './src/components/ReferenceCurve.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace the Edit Metas table with read-only
content = content.replace(
  /<td className="px-3 py-2 p-1">\s*<input type="number".*?value={editableMetas.metaAlojamento}.*?\/>\s*<\/td>/g,
  '<td className="px-3 py-2">{editableMetas.metaAlojamento.toFixed(2)}</td>'
);
content = content.replace(
  /<td className="px-3 py-2 p-1">\s*<input type="number".*?value={editableMetas.metaCrescimento1}.*?\/>\s*<\/td>/g,
  '<td className="px-3 py-2">{editableMetas.metaCrescimento1.toFixed(2)}</td>'
);
content = content.replace(
  /<td className="px-3 py-2 p-1">\s*<input type="number".*?value={editableMetas.metaCrescimento2}.*?\/>\s*<\/td>/g,
  '<td className="px-3 py-2">{editableMetas.metaCrescimento2.toFixed(2)}</td>'
);
content = content.replace(
  /<td className="px-3 py-2 p-1">\s*<input type="number".*?value={editableMetas.metaCrescimento3}.*?\/>\s*<\/td>/g,
  '<td className="px-3 py-2">{editableMetas.metaCrescimento3.toFixed(2)}</td>'
);
content = content.replace(
  /<td className="px-3 py-2 p-1">\s*<input type="number".*?value={editableMetas.metaTerminacao1}.*?\/>\s*<\/td>/g,
  '<td className="px-3 py-2">{editableMetas.metaTerminacao1.toFixed(2)}</td>'
);
content = content.replace(
  /<td className="px-3 py-2 p-1">\s*<input type="number".*?value={editableMetas.metaTerminacao2}.*?\/>\s*<\/td>/g,
  '<td className="px-3 py-2">{editableMetas.metaTerminacao2.toFixed(2)}</td>'
);

// Replace GPD and CMD inputs with read-only
content = content.replace(
  /<td className="px-3 py-1 border-x border-emerald-50">\s*<input[^>]*value={row\.gpd}[^>]*\/>\s*<\/td>/g,
  '<td className="px-3 py-1 border-x border-slate-100 font-medium text-emerald-700">{row.gpd.toFixed(3)}</td>'
);
content = content.replace(
  /<td className="px-3 py-1 border-x border-emerald-50">\s*<input[^>]*value={row\.cmd}[^>]*\/>\s*<\/td>/g,
  '<td className="px-3 py-1 border-x border-slate-100 font-medium text-emerald-700">{row.cmd.toFixed(3)}</td>'
);

// Remove the instruction to edit
content = content.replace(
  '<span className="text-xs font-normal text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Edite as colunas GPD e CMD</span>',
  '<span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded">Visualização Bloqueada</span>'
);

// Add the UI to add/delete curves from EmpresaConfigGestao
// Wait, I need to inject it right before the data tables, after the selectors.
const injectionPoint = '{loading ? (';

// I need to make sure the state is there.
const stateInjectionPoint = 'const [editableMetas, setEditableMetas] = useState<any>(null);';

const states = `
  const [editableMetas, setEditableMetas] = useState<any>(null);
  const [isAddingCurva, setIsAddingCurva] = useState(false);
  const [newCurva, setNewCurva] = useState<Partial<CurveConfig>>({});
`;

content = content.replace(stateInjectionPoint, states);

const versionBlock = `
      {/* Versões de Curvas */}
      {!loading && selectedEmpresaId && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Versões de Curvas de Desempenho</h3>
              <p className="text-xs text-slate-500">Gerencie as versões de curvas para os cálculos deste cliente.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsAddingCurva(true);
                setNewCurva({
                  nome: '',
                  dataVigencia: new Date().toISOString().split('T')[0],
                  tipoLote: 'Misto',
                  tipoCalculo: config?.tipo_calculo_curva || 'DIA_UM',
                  metaMortalidade: config?.meta_mortalidade || 0
                });
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 text-sm font-medium"
            >
              Nova Versão
            </button>
          </div>

          {isAddingCurva && (
            <div className="bg-slate-50 p-4 rounded-lg border border-emerald-200 mb-4">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Adicionar Nova Versão</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Nome da Versão</label>
                  <input
                    type="text"
                    value={newCurva.nome || ''}
                    onChange={e => setNewCurva({...newCurva, nome: e.target.value})}
                    placeholder="Ex: Curva 2026 Misto"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Data de Vigência</label>
                  <input
                    type="date"
                    value={newCurva.dataVigencia || ''}
                    onChange={e => setNewCurva({...newCurva, dataVigencia: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Tipo de Lote</label>
                  <select
                    value={newCurva.tipoLote || 'Misto'}
                    onChange={e => setNewCurva({...newCurva, tipoLote: e.target.value as any})}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Misto">Misto</option>
                    <option value="Macho">Macho</option>
                    <option value="Fêmea">Fêmea</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Curva Base (Template)</label>
                  <select
                    id="curvaTemplate"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                  >
                    <option value="misto_v2">Padrão Misto (Atual)</option>
                    <option value="misto_v1">Padrão Misto (Legada)</option>
                    <option value="femea">Padrão Fêmea</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsAddingCurva(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-200 rounded-md bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    if (!newCurva.nome || !newCurva.dataVigencia) {
                      alert('Preencha o nome e a data de vigência.');
                      return;
                    }
                    setSaving(true);
                    
                    const { growthCurvesMisto, growthCurveFemea, defaultMetas, defaultMetasFemea } = await import('../data');
                    const template = (document.getElementById('curvaTemplate') as HTMLSelectElement).value;
                    let curveData = growthCurvesMisto[growthCurvesMisto.length - 1].curve;
                    let metasData = defaultMetas;
                    
                    if (template === 'misto_v1') {
                      curveData = growthCurvesMisto[0].curve;
                      metasData = growthCurvesMisto[0].metas;
                    } else if (template === 'femea') {
                      curveData = growthCurveFemea;
                      metasData = defaultMetasFemea;
                    }

                    const nova: CurveConfig = {
                      id: crypto.randomUUID(),
                      nome: newCurva.nome,
                      dataVigencia: newCurva.dataVigencia,
                      tipoLote: newCurva.tipoLote as any || 'Misto',
                      tipoCalculo: config?.tipo_calculo_curva || 'DIA_UM',
                      metaMortalidade: config?.meta_mortalidade || 0,
                      curve: curveData,
                      metas: metasData
                    };
                    
                    const updatedCurvas = [...curvas, nova];
                    
                    try {
                      const { error: saveErr } = await supabase
                        .from('empresa_configuracoes')
                        .update({ curva_desempenho: updatedCurvas })
                        .eq('empresa_id', selectedEmpresaId);

                      if (saveErr) throw saveErr;
                      
                      setCurvas(updatedCurvas);
                      setIsAddingCurva(false);
                      setNewCurva({});
                      setSelectedCurvaId(nova.id);
                      setSuccess('Nova versão adicionada com sucesso!');
                      setTimeout(() => setSuccess(null), 3000);
                    } catch (err: any) {
                      console.error(err);
                      setError('Erro ao salvar nova curva.');
                    } finally {
                      setSaving(false);
                    }
                  }}
                  disabled={saving}
                  className="px-4 py-2 text-sm bg-emerald-600 text-white hover:bg-emerald-700 rounded-md font-medium disabled:opacity-50"
                >
                  {saving ? 'Adicionando...' : 'Adicionar Curva'}
                </button>
              </div>
            </div>
          )}

          {curvas.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-sm bg-white rounded-lg border border-slate-200">
              Nenhuma curva cadastrada.
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-lg border border-slate-200">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700">
                  <tr>
                    <th className="px-4 py-3">Nome</th>
                    <th className="px-4 py-3">Vigência</th>
                    <th className="px-4 py-3">Tipo Lote</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {curvas.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-slate-800">{c.nome}</td>
                      <td className="px-4 py-3">{new Date(c.dataVigencia + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                          {c.tipoLote || 'Misto'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={async () => {
                            if(confirm('Tem certeza que deseja remover esta curva? Lotes que dependem dela podem ser afetados.')) {
                              setSaving(true);
                              const updatedCurvas = curvas.filter(cv => cv.id !== c.id);
                              try {
                                await supabase.from('empresa_configuracoes').update({ curva_desempenho: updatedCurvas }).eq('empresa_id', selectedEmpresaId);
                                setCurvas(updatedCurvas);
                                if (selectedCurvaId === c.id) {
                                  setSelectedCurvaId(updatedCurvas.length > 0 ? updatedCurvas[0].id : '');
                                }
                              } catch(e) { console.error(e); }
                              setSaving(false);
                            }
                          }}
                          disabled={saving}
                          className="text-red-500 hover:text-red-700 p-1 font-medium"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {loading ? (
`;

content = content.replace(injectionPoint, versionBlock);

// Remove handleSave and handleCurveChange and handleMetaChange from being useful for the UI, or just remove the Salvar button from the top.
content = content.replace(
  /<div className="w-full sm:w-1\/3 flex justify-end">\s*<button\s*onClick={handleSave}[^>]*>\s*<Save className="w-5 h-5" \/>\s*\{saving \? 'Salvando...' : 'Salvar Alterações'\}\s*<\/button>\s*<\/div>/g,
  ''
);

// We need to fix the "Este cliente não possui nenhuma versão..."
content = content.replace(
  'Vá em <b>Parâmetros por Cliente</b> para adicionar uma nova versão.',
  'Utilize o painel acima para adicionar uma nova versão.'
);

fs.writeFileSync(path, content);
