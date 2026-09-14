const fs = require('fs');
let code = fs.readFileSync('src/components/ReferenceCurve.tsx', 'utf8');

const UI = `
                  <tr className="bg-slate-50">
                    <td className="px-3 py-2 text-slate-700 font-semibold text-xs text-left border-r border-slate-100">Duração (dias)</td>
                    <td className="px-3 py-2 text-sm text-slate-500">{config?.programa_alimentar?.find(f => f.fase === 'Alojamento')?.duracaoDias || '-'}</td>
                    <td className="px-3 py-2 text-sm text-slate-500">{config?.programa_alimentar?.find(f => f.fase === 'Crescimento 1')?.duracaoDias || '-'}</td>
                    <td className="px-3 py-2 text-sm text-slate-500">{config?.programa_alimentar?.find(f => f.fase === 'Crescimento 2')?.duracaoDias || '-'}</td>
                    <td className="px-3 py-2 text-sm text-slate-500">{config?.programa_alimentar?.find(f => f.fase === 'Crescimento 3')?.duracaoDias || '-'}</td>
                    <td className="px-3 py-2 text-sm text-slate-500">{config?.programa_alimentar?.find(f => f.fase === 'Terminação 1')?.duracaoDias || '-'}</td>
                    <td className="px-3 py-2 text-sm text-slate-500">{config?.programa_alimentar?.find(f => f.fase === 'Terminação 2')?.duracaoDias || '-'}</td>
                    <td className="px-3 py-2 text-sm text-slate-500 bg-[#1A3A5B]/5 font-semibold">{config?.programa_alimentar?.reduce((acc, curr) => acc + (curr.duracaoDias || 0), 0) || '-'}</td>
                  </tr>
`;

code = code.replace(
  /<td className="px-3 py-2 text-slate-700 font-semibold text-xs text-left border-r border-slate-100 bg-slate-50">Meta \(kg\)<\/td>/,
  UI.trim() + '\n                  <tr>\n                    <td className="px-3 py-2 text-slate-700 font-semibold text-xs text-left border-r border-slate-100 bg-slate-50">Meta (kg)</td>'
);

fs.writeFileSync('src/components/ReferenceCurve.tsx', code);
