const fs = require('fs');
let code = fs.readFileSync('src/components/EmpresaConfigGestao.tsx', 'utf8');

const uiHtml = `
                  <div className="col-span-1 sm:col-span-2 mt-4 pt-4 border-t border-slate-200">
                    <h4 className="text-sm font-bold text-slate-700 mb-2">Programa Alimentar (Duração das Fases em Dias)</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                      {fasesGompertz.map((faseObj, idx) => (
                        <div key={idx}>
                          <label className="block text-xs font-medium text-slate-600 mb-1">{faseObj.fase}</label>
                          <input
                            type="number"
                            min="1"
                            value={faseObj.duracaoDias}
                            onChange={(e) => {
                              const newFases = [...fasesGompertz];
                              newFases[idx].duracaoDias = parseInt(e.target.value) || 0;
                              setFasesGompertz(newFases);
                            }}
                            className="w-full px-2 py-1 text-sm bg-white border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
`;

code = code.replace(
  /(\s+)(\}\)\}\s*className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"\s*\/>\s*<\/div>\s*<\/div>\s*\)\}\s*<\/div>\s*<\/div>\s*\{\/\* Listas Permitidas \*\/)/,
  `$1$2`.replace('</div>\n                )}\n                </div>', '</div>\n' + uiHtml + '\n                )}\n                </div>')
);
// The above regex might be fragile. Let's do a more robust approach.
