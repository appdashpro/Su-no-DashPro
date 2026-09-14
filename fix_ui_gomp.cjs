const fs = require('fs');

let file = 'src/components/EmpresaConfigGestao.tsx';
let code = fs.readFileSync(file, 'utf8');

const regex = /<select[\s\S]*?onChange=\{\(e\) => setTipoCalculo\(e\.target\.value as 'DIA_UM' \| 'PESO_ALOJAMENTO'\)\}[\s\S]*?<\/select>/;

const newSelect = `<select
                      value={tipoCalculo}
                      onChange={(e) => setTipoCalculo(e.target.value as 'DIA_UM' | 'PESO_ALOJAMENTO' | 'GOMPERTZ')}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="DIA_UM">Cronológico Padrão (Inicia no Dia 1)</option>
                      <option value="PESO_ALOJAMENTO">Deslocamento Inteligente (Pelo Peso de Alojamento)</option>
                      <option value="GOMPERTZ">Gompertz Dinâmico (Modelo Bioenergético)</option>
                    </select>`;

code = code.replace(regex, newSelect);

const afterMetaDiv = `                  <div>
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
                  </div>`;

const gompertzUi = `
                {tipoCalculo === 'GOMPERTZ' && (
                  <div className="col-span-1 sm:col-span-2 mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-200 pt-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Peso Maduro (Pm)
                      </label>
                      <input
                        type="number" step="0.1"
                        value={gompertzParams.pm}
                        onChange={(e) => setGompertzParams(p => ({...p, pm: parseFloat(e.target.value) || 0}))}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Taxa Maturação (b)
                      </label>
                      <input
                        type="number" step="0.001"
                        value={gompertzParams.b}
                        onChange={(e) => setGompertzParams(p => ({...p, b: parseFloat(e.target.value) || 0}))}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Energia Ração (EM)
                      </label>
                      <input
                        type="number" step="1"
                        value={gompertzParams.em}
                        onChange={(e) => setGompertzParams(p => ({...p, em: parseInt(e.target.value) || 0}))}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                )}`;

code = code.replace(afterMetaDiv, afterMetaDiv + gompertzUi);

fs.writeFileSync(file, code);
