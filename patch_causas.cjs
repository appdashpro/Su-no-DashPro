const fs = require('fs');
let code = fs.readFileSync('src/components/EmpresaConfigGestao.tsx', 'utf8');

// Add edit state for causas right after newCausa state
code = code.replace(
  "const [newCausa, setNewCausa] = useState('');",
  "const [newCausa, setNewCausa] = useState('');\n  const [editingCausa, setEditingCausa] = useState<{old: string, new: string} | null>(null);"
);

const oldMapRegex = /<div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-2 bg-white rounded-lg border border-slate-200">\s*\{causas\.map\(causa => \(\s*<span key=\{causa\} className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-800 rounded-full text-xs font-medium border border-orange-200 shadow-sm">\s*\{causa\}\s*\{isMaster && \(<button onClick=\{\(\) => removeCausa\(causa\)\} className="hover:text-red-500 ml-1 text-slate-400">\s*<X className="w-3 h-3" \/>\s*<\/button>\)\}\s*<\/span>\s*\)\)\}\s*\{causas\.length === 0 && <span className="text-sm text-slate-400 italic">Nenhuma causa na lista\.<\/span>\}\s*<\/div>/s;

const newMapStr = `<div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto p-2 bg-white rounded-lg border border-slate-200">
                    {causas.map((causa, idx) => {
                      const isEditing = editingCausa?.old === causa;
                      
                      if (isEditing) {
                        return (
                          <div key={causa + idx} className="flex items-center gap-2 bg-orange-50 p-2 rounded-lg border border-orange-200">
                            <input
                              type="text"
                              value={editingCausa.new}
                              onChange={e => setEditingCausa({...editingCausa, new: e.target.value})}
                              placeholder="Nome da causa"
                              className="flex-1 px-2 py-1 text-sm border border-orange-300 rounded outline-none focus:ring-1 focus:ring-orange-500"
                              autoFocus
                            />
                            <button
                              onClick={() => {
                                const newName = editingCausa.new.trim();
                                if (newName && newName !== editingCausa.old && !causas.includes(newName)) {
                                  const newCausas = [...causas];
                                  const targetIdx = newCausas.indexOf(editingCausa.old);
                                  if (targetIdx !== -1) {
                                    newCausas[targetIdx] = newName;
                                    setCausas(newCausas);
                                  }
                                }
                                setEditingCausa(null);
                              }}
                              className="p-1.5 bg-orange-600 text-white rounded hover:bg-orange-700 shadow-sm"
                              title="Salvar"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => setEditingCausa(null)} className="p-1.5 bg-slate-200 text-slate-600 rounded hover:bg-slate-300 shadow-sm" title="Cancelar">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      }

                      return (
                        <div key={causa + idx} className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 hover:border-orange-300 transition-colors group">
                          <span className="text-sm font-medium text-slate-700">{causa}</span>
                          {isMaster && (
                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                              <button onClick={() => setEditingCausa({ old: causa, new: causa })} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded" title="Editar">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => removeCausa(causa)} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Remover">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {causas.length === 0 && <span className="text-sm text-slate-400 italic">Nenhuma causa na lista.</span>}
                  </div>`;

if (!oldMapRegex.test(code)) {
  console.log("Could not match the map regex!");
} else {
  code = code.replace(oldMapRegex, newMapStr);
  fs.writeFileSync('src/components/EmpresaConfigGestao.tsx', code);
  console.log("Replaced successfully!");
}

