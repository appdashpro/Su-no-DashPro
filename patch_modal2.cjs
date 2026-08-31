const fs = require('fs');
let content = fs.readFileSync('src/components/IntegradoDetailsModal.tsx', 'utf8');

const targetStr = `                         let status = '-';
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
                             <td className="px-4 py-3 text-center">`;

const replacement = `                         let status = '-';
                         let statusClass = 'text-slate-400';
                         let textClass = 'text-slate-800';
                         if (meta !== null && meta !== undefined && real !== null && real !== undefined && Number(real) > 0) {
                            const diffPerc = ((Number(real) - Number(meta)) / Number(meta)) * 100;
                            status = (diffPerc > 0 ? '+' : '') + diffPerc.toFixed(1) + '%';
                            if (diffPerc >= -5 && diffPerc <= 5) {
                               statusClass = 'text-emerald-600 bg-emerald-50';
                               textClass = 'text-emerald-600';
                            } else if (diffPerc > 5) {
                               statusClass = 'text-red-600 bg-red-50';
                               textClass = 'text-red-600';
                            } else {
                               statusClass = 'text-blue-600 bg-blue-50';
                               textClass = 'text-blue-600';
                            }
                         } else if (meta !== null && (real === null || real === undefined || Number(real) === 0)) {
                            status = 'Pendente';
                            statusClass = 'text-slate-500 bg-slate-100';
                            textClass = 'text-slate-400';
                         }
                         
                         return (
                           <tr key={fase.name} className="hover:bg-slate-50/50 transition-colors">
                             <td className="px-4 py-3 font-medium text-slate-700">{fase.name}</td>
                             <td className="px-4 py-3 text-right text-slate-600">{meta !== null && meta !== undefined ? Number(meta).toFixed(2) + ' kg' : '-'}</td>
                             <td className={\`px-4 py-3 text-right font-bold \${textClass}\`}>{real !== null && real !== undefined && Number(real) > 0 ? Number(real).toFixed(2) + ' kg' : '-'}</td>
                             <td className="px-4 py-3 text-center">`;

content = content.replace(targetStr, replacement);
fs.writeFileSync('src/components/IntegradoDetailsModal.tsx', content);
console.log("Patched");
