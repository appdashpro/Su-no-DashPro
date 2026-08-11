const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

const oldTable = /\{isExporting && selectedIntegradoIds\.length === 1 && \([\s\S]*?<\/div>\n\s*\)\}/;

const newTable = `{isExporting && selectedIntegradoIds.length === 1 && (
        <div className="mt-8 bg-white p-6 rounded-xl border border-slate-200" style={{ pageBreakInside: 'avoid' }}>
          <h2 className="text-xl font-bold text-slate-800 mb-4">Relatório Detalhado: {filteredIntegrados[0]?.name}</h2>
          
          <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
            <div>
              <p className="text-xs text-slate-500 font-medium">Data de Alojamento</p>
              <p className="text-sm font-semibold text-slate-800">{filteredIntegrados[0]?.alojamentoDate ? filteredIntegrados[0].alojamentoDate.split('-').reverse().join('/') : 'N/D'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total de Visitas</p>
              <p className="text-sm font-semibold text-slate-800">{filteredVisits.length}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Idade Atual</p>
              <p className="text-sm font-semibold text-slate-800">{filteredVisits.length > 0 ? Math.max(...filteredVisits.map(v => v.idade || 0)) : 0} dias</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Desvio Atual</p>
              <p className={\`text-sm font-semibold \${stats.avgDiferenca > 0 ? 'text-red-600' : stats.avgDiferenca < 0 ? 'text-emerald-600' : 'text-slate-800'}\`}>
                {stats.avgDiferenca > 0 ? '+' : ''}{stats.avgDiferenca.toFixed(2)} kg
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-700">Data</th>
                  <th className="px-4 py-3 font-semibold text-slate-700 text-center">Idade</th>
                  <th className="px-4 py-3 font-semibold text-slate-700 text-right">Cons. (kg)</th>
                  <th className="px-4 py-3 font-semibold text-slate-700 text-right">Meta (kg)</th>
                  <th className="px-4 py-3 font-semibold text-slate-700 text-right">Desvio (kg)</th>
                  <th className="px-4 py-3 font-semibold text-slate-700 text-center">Alojados</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Tratamentos & Obs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVisits.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((v) => {
                  const dif = v.consumoAcumuladoReal ? v.consumoAcumuladoReal - (v.metaAcumulada || 0) : 0;
                  const hasTratamentos = v.tratamentos && v.tratamentos.length > 0;
                  return (
                    <tr key={v.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{v.date.split('-').reverse().join('/')}</td>
                      <td className="px-4 py-3 text-slate-700 text-center">{v.idade}</td>
                      <td className="px-4 py-3 text-slate-700 text-right font-medium">{v.consumoAcumuladoReal}</td>
                      <td className="px-4 py-3 text-slate-700 text-right">{v.metaAcumulada?.toFixed(2)}</td>
                      <td className={\`px-4 py-3 font-semibold text-right \${dif > 0 ? 'text-red-600' : dif < 0 ? 'text-emerald-600' : 'text-slate-700'}\`}>
                        {dif > 0 ? '+' : ''}{dif.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-slate-700 text-center">{v.animaisAlojados}</td>
                      <td className="px-4 py-3 text-slate-700 max-w-xs">
                        {hasTratamentos && (
                          <div className="flex flex-wrap gap-1 mb-1">
                            {v.tratamentos?.map((t, idx) => (
                              <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800 border border-amber-200">
                                {t.produto} ({t.doseMgKg}mg, {t.duracaoDias}d)
                              </span>
                            ))}
                          </div>
                        )}
                        {v.recomendacao && (
                          <p className="text-xs text-slate-500 truncate" title={v.recomendacao}>
                            {v.recomendacao}
                          </p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}`;

code = code.replace(oldTable, newTable);
fs.writeFileSync('src/components/Dashboard.tsx', code);
console.log('patched table');
