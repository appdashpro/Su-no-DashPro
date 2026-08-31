const fs = require('fs');
let content = fs.readFileSync('src/components/IntegradoDetailsModal.tsx', 'utf8');

const targetStr = `              <h4 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">Histórico de Visitas</h4>`;

const injection = `
              <div className="mb-8 mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-0">Programa Alimentar (Meta vs Realizado)</h4>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                   <table className="w-full text-sm text-left">
                     <thead className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 uppercase">
                       <tr>
                         <th className="px-4 py-3 font-semibold">Fase</th>
                         <th className="px-4 py-3 font-semibold text-right">Meta</th>
                         <th className="px-4 py-3 font-semibold text-right">Realizado</th>
                         <th className="px-4 py-3 font-semibold text-center">Aderência</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                       {[
                         { name: 'Alojamento', metaKey: 'metaAlojamento', realKey: 'consumoAlojamento' },
                         { name: 'Crescimento 1', metaKey: 'metaCrescimento1', realKey: 'consumoCrescimento1' },
                         { name: 'Crescimento 2', metaKey: 'metaCrescimento2', realKey: 'consumoCrescimento2' },
                         { name: 'Crescimento 3', metaKey: 'metaCrescimento3', realKey: 'consumoCrescimento3' },
                         { name: 'Terminação 1', metaKey: 'metaTerminacao1', realKey: 'consumoTerminacao1' },
                         { name: 'Terminação 2', metaKey: 'metaTerminacao2', realKey: 'consumoTerminacao2' },
                       ].map((fase) => {
                         const meta = metas ? (metas as any)[fase.metaKey] : null;
                         const real = latestVisit ? (latestVisit as any)[fase.realKey] : null;
                         
                         if (!meta && !real) return null;
                         
                         let status = '-';
                         let statusClass = 'text-slate-400';
                         if (meta !== null && meta !== undefined && real !== null && real !== undefined && Number(real) > 0) {
                            const adherence = (Number(real) / Number(meta)) * 100;
                            status = adherence.toFixed(1) + '%';
                            if (adherence >= 95 && adherence <= 105) {
                               statusClass = 'text-emerald-600 bg-emerald-50';
                            } else if (adherence > 105) {
                               statusClass = 'text-red-600 bg-red-50';
                            } else {
                               statusClass = 'text-blue-600 bg-blue-50';
                            }
                         } else if (meta !== null && (real === null || real === undefined || Number(real) === 0)) {
                            status = 'Pendente';
                            statusClass = 'text-slate-500 bg-slate-100';
                         }
                         
                         return (
                           <tr key={fase.name} className="hover:bg-slate-50/50 transition-colors">
                             <td className="px-4 py-3 font-medium text-slate-700">{fase.name}</td>
                             <td className="px-4 py-3 text-right text-slate-600">{meta !== null && meta !== undefined ? Number(meta).toFixed(2) + ' kg' : '-'}</td>
                             <td className="px-4 py-3 text-right font-medium text-slate-800">{real !== null && real !== undefined && Number(real) > 0 ? Number(real).toFixed(2) + ' kg' : '-'}</td>
                             <td className="px-4 py-3 text-center">
                               {status !== '-' ? (
                                 <span className={\`text-[10px] font-bold px-2 py-1 rounded \${statusClass}\`}>
                                   {status}
                                 </span>
                               ) : '-'}
                             </td>
                           </tr>
                         );
                       })}
                     </tbody>
                   </table>
                </div>
              </div>
`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, injection + targetStr);
  fs.writeFileSync('src/components/IntegradoDetailsModal.tsx', content);
  console.log("Injected Successfully!");
} else {
  console.log("Failed to inject.");
}
