const fs = require('fs');
let code = fs.readFileSync('src/components/Visits.tsx', 'utf-8');

const tableSearch = `<td className="px-2 py-2 whitespace-nowrap">{v.animaisMortos ?? '-'}</td>`;
const tableReplace = `<td className="px-2 py-2 whitespace-nowrap">
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
                    </td>`;

code = code.replace(tableSearch, tableReplace);

const modalSearch = `<span className="font-medium text-slate-700">{visit.animaisMortos ?? '-'}</span>`;
const modalReplace = `<span className="font-medium text-slate-700 flex items-center gap-1.5">
                            {visit.animaisMortos ?? '-'}
                            {visit.animaisMortos !== undefined && visit.animaisMortos !== null && visit.animaisAlojados ? (
                              <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                                {((Number(visit.animaisMortos) / Number(visit.animaisAlojados)) * 100).toFixed(2)}%
                              </span>
                            ) : visit.mortalidade ? (
                              <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                                {visit.mortalidade}%
                              </span>
                            ) : null}
                          </span>`;

code = code.replace(modalSearch, modalReplace);

fs.writeFileSync('src/components/Visits.tsx', code);
console.log('Done!');
