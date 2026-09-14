const fs = require('fs');
let code = fs.readFileSync('src/components/ReferenceCurve.tsx', 'utf8');

// Remove the injected HTML row
const badRow = `
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
code = code.replace(badRow.trim(), '');

// Update getPhaseDuration
code = code.replace(
  /const getPhaseDuration = \(phaseName: string\) => \{[\s\S]*?return '-';\s*\};/,
  `const getPhaseDuration = (phaseName: string) => {
    const progAlim = getActiveProgramaAlimentar();
    if (!progAlim) return '-';
    // Check new Gompertz structure
    const newProg = progAlim.find((p: any) => p.fase && p.fase.toLowerCase() === phaseName.toLowerCase());
    if (newProg && newProg.duracaoDias) {
      return newProg.duracaoDias;
    }
    // Check old structure
    const prog = progAlim.find((p: any) => (p.nome && p.nome.toLowerCase() === phaseName.toLowerCase()) || (p.racao && p.racao.toLowerCase() === phaseName.toLowerCase()));
    if (prog) {
      const dias = (Number(prog.dia_fim) - Number(prog.dia_inicio)) + 1;
      return isNaN(dias) ? '-' : dias;
    }
    return '-';
  };`
);

// Update getTotalDuration
code = code.replace(
  /const getTotalDuration = \(\) => \{[\s\S]*?return total === 0 \? '-' : total;\s*\};/,
  `const getTotalDuration = () => {
    const progAlim = getActiveProgramaAlimentar();
    if (!progAlim) return '-';
    
    // Check if new structure is used
    if (progAlim.length > 0 && progAlim[0].fase) {
      const total = progAlim.reduce((sum: number, p: any) => sum + (Number(p.duracaoDias) || 0), 0);
      return total === 0 ? '-' : total;
    }

    let total = 0;
    progAlim.forEach((p: any) => {
      if (p.dia_inicio !== undefined && p.dia_fim !== undefined) {
         total += (Number(p.dia_fim) - Number(p.dia_inicio)) + 1;
      }
    });
    return total === 0 ? '-' : total;
  };`
);


fs.writeFileSync('src/components/ReferenceCurve.tsx', code);
