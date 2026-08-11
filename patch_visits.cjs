const fs = require('fs');
let code = fs.readFileSync('src/components/Visits.tsx', 'utf-8');

code = code.replace(
  '<th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Vol. Cargas (kg)</th>',
  '<th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Mortalidade (%)</th>\n                <th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Vol. Cargas (kg)</th>'
);

code = code.replace(
  '<th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Cons. Aloj</th>',
  '<th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Cons. Aloj</th>\n                <th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Carga Aloj</th>'
);

code = code.replace(
  '<th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Cons. Cresc 1</th>',
  '<th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Cons. Cresc 1</th>\n                <th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Carga Cresc 1</th>'
);

code = code.replace(
  '<th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Cons. Cresc 2</th>',
  '<th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Cons. Cresc 2</th>\n                <th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Carga Cresc 2</th>'
);

code = code.replace(
  '<th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Cons. Cresc 3</th>',
  '<th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Cons. Cresc 3</th>\n                <th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Carga Cresc 3</th>'
);

code = code.replace(
  '<th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Cons. Term 1</th>',
  '<th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Cons. Term 1</th>\n                <th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Carga Term 1</th>'
);

code = code.replace(
  '<th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Cons. Term 2</th>',
  '<th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Cons. Term 2</th>\n                <th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Carga Term 2</th>'
);

// Now for the <td>s

code = code.replace(
  `                    <td className="px-2 py-2 whitespace-nowrap">
                      {v.animaisMortos !== undefined && v.animaisMortos !== null ? (
                        <div className="flex items-center gap-1.5">
                          <span>{v.animaisMortos}</span>
                          {v.animaisAlojados ? (
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">
                              {((Number(v.animaisMortos) / Number(v.animaisAlojados)) * 100).toFixed(2)}%
                            </span>
                          ) : v.mortalidade ? (
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">
                              {v.mortalidade}%
                            </span>
                          ) : null}
                        </div>
                      ) : '-'}
                    </td>`,
  `                    <td className="px-2 py-2 whitespace-nowrap">{v.animaisMortos ?? '-'}</td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      {v.mortalidade !== undefined && v.mortalidade !== null 
                        ? <span className="text-xs font-medium text-red-600 bg-red-50 px-1.5 py-0.5 rounded">{v.mortalidade}%</span> 
                        : v.animaisAlojados && v.animaisMortos ? <span className="text-xs font-medium text-red-600 bg-red-50 px-1.5 py-0.5 rounded">{((Number(v.animaisMortos)/Number(v.animaisAlojados))*100).toFixed(2)}%</span> : '-'}
                    </td>`
);


code = code.replace(
  '<td className="px-2 py-2 whitespace-nowrap text-xs">{v.consumoAlojamento ?? \'-\'}</td>',
  '<td className="px-2 py-2 whitespace-nowrap text-xs">{v.consumoAlojamento ?? \'-\'}</td>\n                    <td className="px-2 py-2 whitespace-nowrap text-xs">{v.cargaAlojamento ?? \'-\'}</td>'
);

code = code.replace(
  '<td className="px-2 py-2 whitespace-nowrap text-xs">{v.consumoCrescimento1 ?? \'-\'}</td>',
  '<td className="px-2 py-2 whitespace-nowrap text-xs">{v.consumoCrescimento1 ?? \'-\'}</td>\n                    <td className="px-2 py-2 whitespace-nowrap text-xs">{v.cargaCrescimento1 ?? \'-\'}</td>'
);

code = code.replace(
  '<td className="px-2 py-2 whitespace-nowrap text-xs">{v.consumoCrescimento2 ?? \'-\'}</td>',
  '<td className="px-2 py-2 whitespace-nowrap text-xs">{v.consumoCrescimento2 ?? \'-\'}</td>\n                    <td className="px-2 py-2 whitespace-nowrap text-xs">{v.cargaCrescimento2 ?? \'-\'}</td>'
);

code = code.replace(
  '<td className="px-2 py-2 whitespace-nowrap text-xs">{v.consumoCrescimento3 ?? \'-\'}</td>',
  '<td className="px-2 py-2 whitespace-nowrap text-xs">{v.consumoCrescimento3 ?? \'-\'}</td>\n                    <td className="px-2 py-2 whitespace-nowrap text-xs">{v.cargaCrescimento3 ?? \'-\'}</td>'
);

code = code.replace(
  '<td className="px-2 py-2 whitespace-nowrap text-xs">{v.consumoTerminacao1 ?? \'-\'}</td>',
  '<td className="px-2 py-2 whitespace-nowrap text-xs">{v.consumoTerminacao1 ?? \'-\'}</td>\n                    <td className="px-2 py-2 whitespace-nowrap text-xs">{v.cargaTerminacao1 ?? \'-\'}</td>'
);

code = code.replace(
  '<td className="px-2 py-2 whitespace-nowrap text-xs">{v.consumoTerminacao2 ?? \'-\'}</td>',
  '<td className="px-2 py-2 whitespace-nowrap text-xs">{v.consumoTerminacao2 ?? \'-\'}</td>\n                    <td className="px-2 py-2 whitespace-nowrap text-xs">{v.cargaTerminacao2 ?? \'-\'}</td>'
);

fs.writeFileSync('src/components/Visits.tsx', code);
console.log('patched Visits.tsx');
