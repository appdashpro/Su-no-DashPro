const fs = require('fs');
let code = fs.readFileSync('src/components/ReferenceCurve.tsx', 'utf8');

const targetStr = `            <div className="overflow-x-auto">
              <table className="w-full text-center text-sm text-slate-600">
                <thead className="bg-[#2D452B] text-white font-medium border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2 text-xs">Aloj (kg)</th>
                    <th className="px-3 py-2 text-xs">C1 (kg)</th>
                    <th className="px-3 py-2 text-xs">C2 (kg)</th>
                    <th className="px-3 py-2 text-xs">C3 (kg)</th>
                    <th className="px-3 py-2 text-xs">T1 (kg)</th>
                    <th className="px-3 py-2 text-xs">T2 (kg)</th>
                    <th className="px-3 py-2 text-xs bg-[#1A3A5B]">Total (kg)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold bg-white">
                  <tr>
                    <td className="px-3 py-2">
                      {isEditing ? (
                        <input type="number" step="0.01" className="w-16 md:w-20 px-1 py-1 text-center border border-slate-300 rounded focus:ring-2 focus:ring-blue-500" value={editableMetas.metaAlojamento || ''} onChange={(e) => handleMetaChange('metaAlojamento', e.target.value)} />
                      ) : (editableMetas.metaAlojamento || 0).toFixed(2)}
                    </td>
                    <td className="px-3 py-2">
                      {isEditing ? (
                        <input type="number" step="0.01" className="w-16 md:w-20 px-1 py-1 text-center border border-slate-300 rounded focus:ring-2 focus:ring-blue-500" value={editableMetas.metaCrescimento1 || ''} onChange={(e) => handleMetaChange('metaCrescimento1', e.target.value)} />
                      ) : (editableMetas.metaCrescimento1 || 0).toFixed(2)}
                    </td>
                    <td className="px-3 py-2">
                      {isEditing ? (
                        <input type="number" step="0.01" className="w-16 md:w-20 px-1 py-1 text-center border border-slate-300 rounded focus:ring-2 focus:ring-blue-500" value={editableMetas.metaCrescimento2 || ''} onChange={(e) => handleMetaChange('metaCrescimento2', e.target.value)} />
                      ) : (editableMetas.metaCrescimento2 || 0).toFixed(2)}
                    </td>
                    <td className="px-3 py-2">
                      {isEditing ? (
                        <input type="number" step="0.01" className="w-16 md:w-20 px-1 py-1 text-center border border-slate-300 rounded focus:ring-2 focus:ring-blue-500" value={editableMetas.metaCrescimento3 || ''} onChange={(e) => handleMetaChange('metaCrescimento3', e.target.value)} />
                      ) : (editableMetas.metaCrescimento3 || 0).toFixed(2)}
                    </td>
                    <td className="px-3 py-2">
                      {isEditing ? (
                        <input type="number" step="0.01" className="w-16 md:w-20 px-1 py-1 text-center border border-slate-300 rounded focus:ring-2 focus:ring-blue-500" value={editableMetas.metaTerminacao1 || ''} onChange={(e) => handleMetaChange('metaTerminacao1', e.target.value)} />
                      ) : (editableMetas.metaTerminacao1 || 0).toFixed(2)}
                    </td>
                    <td className="px-3 py-2">
                      {isEditing ? (
                        <input type="number" step="0.01" className="w-16 md:w-20 px-1 py-1 text-center border border-slate-300 rounded focus:ring-2 focus:ring-blue-500" value={editableMetas.metaTerminacao2 || ''} onChange={(e) => handleMetaChange('metaTerminacao2', e.target.value)} />
                      ) : (editableMetas.metaTerminacao2 || 0).toFixed(2)}
                    </td>
                    <td className="px-3 py-2 font-bold bg-[#1A3A5B] text-white">
                      {(editableMetas.metaAcumulada || 0).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>`;

const replaceStr = `            <div className="overflow-x-auto">
              <table className="w-full text-center text-sm text-slate-600">
                <thead className="bg-[#2D452B] text-white font-medium border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2 text-xs text-left">Indicador</th>
                    <th className="px-3 py-2 text-xs">Alojamento</th>
                    <th className="px-3 py-2 text-xs">Cresc 1</th>
                    <th className="px-3 py-2 text-xs">Cresc 2</th>
                    <th className="px-3 py-2 text-xs">Cresc 3</th>
                    <th className="px-3 py-2 text-xs">Term 1</th>
                    <th className="px-3 py-2 text-xs">Term 2</th>
                    <th className="px-3 py-2 text-xs bg-[#1A3A5B]">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  <tr>
                    <td className="px-3 py-2 text-slate-700 font-semibold text-xs text-left border-r border-slate-100 bg-slate-50">Meta (kg)</td>
                    <td className="px-3 py-2 font-semibold">
                      {isEditing ? (
                        <input type="number" step="0.01" className="w-16 md:w-20 px-1 py-1 text-center border border-slate-300 rounded focus:ring-2 focus:ring-blue-500" value={editableMetas.metaAlojamento || ''} onChange={(e) => handleMetaChange('metaAlojamento', e.target.value)} />
                      ) : (editableMetas.metaAlojamento || 0).toFixed(2)}
                    </td>
                    <td className="px-3 py-2 font-semibold">
                      {isEditing ? (
                        <input type="number" step="0.01" className="w-16 md:w-20 px-1 py-1 text-center border border-slate-300 rounded focus:ring-2 focus:ring-blue-500" value={editableMetas.metaCrescimento1 || ''} onChange={(e) => handleMetaChange('metaCrescimento1', e.target.value)} />
                      ) : (editableMetas.metaCrescimento1 || 0).toFixed(2)}
                    </td>
                    <td className="px-3 py-2 font-semibold">
                      {isEditing ? (
                        <input type="number" step="0.01" className="w-16 md:w-20 px-1 py-1 text-center border border-slate-300 rounded focus:ring-2 focus:ring-blue-500" value={editableMetas.metaCrescimento2 || ''} onChange={(e) => handleMetaChange('metaCrescimento2', e.target.value)} />
                      ) : (editableMetas.metaCrescimento2 || 0).toFixed(2)}
                    </td>
                    <td className="px-3 py-2 font-semibold">
                      {isEditing ? (
                        <input type="number" step="0.01" className="w-16 md:w-20 px-1 py-1 text-center border border-slate-300 rounded focus:ring-2 focus:ring-blue-500" value={editableMetas.metaCrescimento3 || ''} onChange={(e) => handleMetaChange('metaCrescimento3', e.target.value)} />
                      ) : (editableMetas.metaCrescimento3 || 0).toFixed(2)}
                    </td>
                    <td className="px-3 py-2 font-semibold">
                      {isEditing ? (
                        <input type="number" step="0.01" className="w-16 md:w-20 px-1 py-1 text-center border border-slate-300 rounded focus:ring-2 focus:ring-blue-500" value={editableMetas.metaTerminacao1 || ''} onChange={(e) => handleMetaChange('metaTerminacao1', e.target.value)} />
                      ) : (editableMetas.metaTerminacao1 || 0).toFixed(2)}
                    </td>
                    <td className="px-3 py-2 font-semibold">
                      {isEditing ? (
                        <input type="number" step="0.01" className="w-16 md:w-20 px-1 py-1 text-center border border-slate-300 rounded focus:ring-2 focus:ring-blue-500" value={editableMetas.metaTerminacao2 || ''} onChange={(e) => handleMetaChange('metaTerminacao2', e.target.value)} />
                      ) : (editableMetas.metaTerminacao2 || 0).toFixed(2)}
                    </td>
                    <td className="px-3 py-2 font-bold bg-[#1A3A5B] text-white">
                      {(editableMetas.metaAcumulada || 0).toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-slate-700 font-semibold text-xs text-left border-r border-slate-100 bg-slate-50">Dias na Fase</td>
                    <td className="px-3 py-2 text-xs text-slate-500 bg-slate-50">{getPhaseDaysInfo('Alojamento')}</td>
                    <td className="px-3 py-2 text-xs text-slate-500 bg-slate-50">{getPhaseDaysInfo('Crescimento 1')}</td>
                    <td className="px-3 py-2 text-xs text-slate-500 bg-slate-50">{getPhaseDaysInfo('Crescimento 2')}</td>
                    <td className="px-3 py-2 text-xs text-slate-500 bg-slate-50">{getPhaseDaysInfo('Crescimento 3')}</td>
                    <td className="px-3 py-2 text-xs text-slate-500 bg-slate-50">{getPhaseDaysInfo('Terminação 1')}</td>
                    <td className="px-3 py-2 text-xs text-slate-500 bg-slate-50">{getPhaseDaysInfo('Terminação 2')}</td>
                    <td className="px-3 py-2 text-xs text-slate-500 bg-slate-50">-</td>
                  </tr>
                </tbody>
              </table>
            </div>`;

code = code.replace(targetStr, replaceStr);

const helperStr = `
  const getPhaseDaysInfo = (phaseName: string) => {
    if (!config || !config.programa_alimentar) return '-';
    const prog = config.programa_alimentar.find((p: any) => p.nome.toLowerCase() === phaseName.toLowerCase() || p.racao.toLowerCase() === phaseName.toLowerCase());
    if (prog) {
      const dias = (Number(prog.dia_fim) - Number(prog.dia_inicio)) + 1;
      return \`\${dias} dias (\${prog.dia_inicio} a \${prog.dia_fim})\`;
    }
    return '-';
  };
`;

code = code.replace(
  "const selectedCurva = currentCurva;\n\n  return (",
  `const selectedCurva = currentCurva;\n${helperStr}\n  return (`
);

fs.writeFileSync('src/components/ReferenceCurve.tsx', code);
