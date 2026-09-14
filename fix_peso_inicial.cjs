const fs = require('fs');

// 1. Update types.ts
let types = fs.readFileSync('src/types.ts', 'utf8');
types = types.replace(
  /gompertz_params\?: \{ pm: number; b: number; em: number; \};/,
  `gompertz_params?: { pm: number; b: number; em: number; pi?: number; };`
);
fs.writeFileSync('src/types.ts', types);

// 2. Update data.ts
let data = fs.readFileSync('src/data.ts', 'utf8');
data = data.replace(
  /const pi = 22\.00; \/\/ Default visualization weight/,
  `const pi = empresaConfig?.gompertz_params?.pi || gParams?.pi || 22.00; // Default visualization weight`
);
data = data.replace(
  /const pi = \(pesoAloj && Number\(pesoAloj\) > 0\) \? Number\(pesoAloj\) : 22\.00;/,
  `const pi = (pesoAloj && Number(pesoAloj) > 0) ? Number(pesoAloj) : (empresaConfig?.gompertz_params?.pi || gParams?.pi || 22.00);`
);
fs.writeFileSync('src/data.ts', data);

// 3. Update EmpresaConfigGestao.tsx
let gestao = fs.readFileSync('src/components/EmpresaConfigGestao.tsx', 'utf8');
gestao = gestao.replace(
  /const \[gompertzParams, setGompertzParams\] = useState\(\{ pm: 260, b: 0\.012, em: 3780 \}\);/,
  `const [gompertzParams, setGompertzParams] = useState({ pm: 260, b: 0.012, em: 3780, pi: 22.00 });`
);
gestao = gestao.replace(
  /setGompertzParams\(\{ pm: gParams\.pm, b: gParams\.b, em: gParams\.em \}\);/,
  `setGompertzParams({ pm: gParams.pm, b: gParams.b, em: gParams.em, pi: gParams.pi || 22.00 });`
);

const newUI = `                  <div className="col-span-1 sm:col-span-2 mt-4 grid grid-cols-1 sm:grid-cols-4 gap-4 border-t border-slate-200 pt-4">
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
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Peso Inicial (Pi)
                      </label>
                      <input
                        type="number" step="0.1"
                        value={gompertzParams.pi || 22.0}
                        onChange={(e) => setGompertzParams(p => ({...p, pi: parseFloat(e.target.value) || 0}))}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>`;

// Regex replacement for UI. Notice the change from sm:grid-cols-3 to sm:grid-cols-4 and the addition of Pi field.
gestao = gestao.replace(
  /<div className="col-span-1 sm:col-span-2 mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-200 pt-4">[\s\S]*?<\/div>\s*<\/div>\s*\)\}/,
  newUI + '\n                )}'
);

fs.writeFileSync('src/components/EmpresaConfigGestao.tsx', gestao);
