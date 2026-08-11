const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

// Insert a table for export at the end of the Dashboard
const endOfDiv = '</div>\n  );\n}';
const exportTable = `
      {isExporting && selectedIntegradoIds.length === 1 && (
        <div className="mt-8 bg-white p-6 rounded-xl border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Relatório de Visitas: {filteredIntegrados[0]?.name}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-700">Data</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Idade (dias)</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Consumo Acum. (kg)</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Meta Acum. (kg)</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Diferença (kg)</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Animais Aloj.</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Mortos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVisits.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((v) => {
                  const dif = v.consumoAcumuladoReal ? v.consumoAcumuladoReal - (v.metaAcumulada || 0) : 0;
                  return (
                    <tr key={v.id}>
                      <td className="px-4 py-3 text-slate-700">{v.date.split('-').reverse().join('/')}</td>
                      <td className="px-4 py-3 text-slate-700">{v.idade}</td>
                      <td className="px-4 py-3 text-slate-700">{v.consumoAcumuladoReal}</td>
                      <td className="px-4 py-3 text-slate-700">{v.metaAcumulada?.toFixed(2)}</td>
                      <td className={\`px-4 py-3 font-medium \${dif > 0 ? 'text-red-600' : dif < 0 ? 'text-emerald-600' : 'text-slate-700'}\`}>
                        {dif > 0 ? '+' : ''}{dif.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{v.animaisAlojados}</td>
                      <td className="px-4 py-3 text-slate-700">{v.animaisMortos}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
`;

code = code.replace(endOfDiv, exportTable + endOfDiv);

fs.writeFileSync('src/components/Dashboard.tsx', code);
console.log('patched export data table');
