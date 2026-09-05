const fs = require('fs');
let code = fs.readFileSync('src/components/EmpresaConfigGestao.tsx', 'utf8');

// Add editing state
code = code.replace(
  "const [newMedicamento, setNewMedicamento] = useState('');",
  "const [newMedicamento, setNewMedicamento] = useState('');\n  const [editingMedicamento, setEditingMedicamento] = useState<{nome: string, custoPorKg: string} | null>(null);"
);

// Update map render to support editing
const oldRender = `<div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-2 bg-white rounded-lg border border-slate-200">
                    {medicamentos.map((med, idx) => {
                      const nome = typeof med === 'string' ? med : med.nome;
                      const custo = typeof med === 'string' ? undefined : med.custoPorKg;
                      return (
                      <span key={nome + idx} className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-medium border border-emerald-200 shadow-sm">
                        {nome} {custo ? \` (R$ \${custo.toFixed(2)})\` : ''}
                        {isMaster && (
                          <button onClick={() => removeMedicamento(nome)} className="hover:text-red-500 ml-1 text-slate-400 transition-colors">
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                      );
                    })}
                    {medicamentos.length === 0 && <span className="text-sm text-slate-400 italic">Nenhum medicamento na lista.</span>}
                  </div>`;

const newRender = `<div className="flex flex-col gap-2 max-h-60 overflow-y-auto p-2 bg-white rounded-lg border border-slate-200">
                    {medicamentos.map((med, idx) => {
                      const nome = typeof med === 'string' ? med : med.nome;
                      const custo = typeof med === 'string' ? undefined : med.custoPorKg;
                      const isEditing = editingMedicamento?.nome === nome;
                      
                      if (isEditing) {
                        return (
                          <div key={nome + idx} className="flex items-center gap-2 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                            <span className="text-sm font-semibold text-emerald-800 w-1/3 truncate">{nome}</span>
                            <input 
                              type="number" 
                              value={editingMedicamento.custoPorKg}
                              onChange={e => setEditingMedicamento({...editingMedicamento, custoPorKg: e.target.value})}
                              placeholder="Novo Custo (R$)"
                              className="flex-1 px-2 py-1 text-sm border border-emerald-300 rounded outline-none focus:ring-1 focus:ring-emerald-500"
                              autoFocus
                            />
                            <button 
                              onClick={() => {
                                const newMeds = [...medicamentos];
                                const targetIdx = newMeds.findIndex(m => (typeof m === 'string' ? m : m.nome) === nome);
                                if (targetIdx !== -1) {
                                  newMeds[targetIdx] = { nome, custoPorKg: parseFloat(editingMedicamento.custoPorKg) || 0 };
                                  setMedicamentos(newMeds);
                                }
                                setEditingMedicamento(null);
                              }}
                              className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => setEditingMedicamento(null)} className="p-1 bg-slate-200 text-slate-600 rounded hover:bg-slate-300">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      }

                      return (
                      <div key={nome + idx} className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 hover:border-emerald-300 transition-colors group">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-700">{nome}</span>
                          {custo !== undefined ? (
                            <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">R$ {custo.toFixed(2)} / kg</span>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Sem custo</span>
                          )}
                        </div>
                        {isMaster && (
                          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                            <button onClick={() => setEditingMedicamento({ nome, custoPorKg: custo?.toString() || '' })} className="p-1 text-blue-500 hover:bg-blue-50 rounded" title="Editar Preço">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => removeMedicamento(nome)} className="p-1 text-red-500 hover:bg-red-50 rounded" title="Remover">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                      );
                    })}
                    {medicamentos.length === 0 && <span className="text-sm text-slate-400 italic">Nenhum medicamento na lista.</span>}
                  </div>`;

// Replace it
if(code.includes('flex flex-wrap gap-2 max-h-60 overflow-y-auto p-2 bg-white rounded-lg border border-slate-200')) {
  // Use a string replacement logic
  const startIdx = code.indexOf('<div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-2 bg-white rounded-lg border border-slate-200">');
  const endIdx = code.indexOf('</div>', startIdx) + 6;
  const endIdx2 = code.indexOf('</div>', endIdx) + 6; 
  // It's a bit risky, let's use a simpler regex or manual replacement
}

