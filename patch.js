const fs = require('fs');
let code = fs.readFileSync('src/components/TratamentosFormSection.tsx', 'utf8');

code = code.replace(
`    const effectiveNewWeight = !isNaN(newWeight as number) && newWeight !== undefined && newWeight > 0 ? newWeight : (pesoEstimadoCurve > 0 ? pesoEstimadoCurve : 0);
    
    // Recalculate all treatments with the new weight
    if (tratamentos.length > 0) {
      const updated = tratamentos.map(t => {
        if (!t.doseMgKg) return { ...t, pesoEstimadoKg: effectiveNewWeight > 0 ? effectiveNewWeight : undefined };
        let mgPorDia = t.doseMgKg * effectiveNewWeight * animaisVivos;
        let produtoPorDia = mgPorDia;
        if (t.concentracao && t.concentracao > 0) {
          produtoPorDia = mgPorDia / (t.concentracao / 100);
        }
        const gramasPorDia = produtoPorDia / 1000;
        return {
          ...t,
          quantidadePorDia: Number(gramasPorDia.toFixed(2)),
          quantidadeTotal: t.duracaoDias ? Number((gramasPorDia * t.duracaoDias).toFixed(2)) : 0,
          pesoEstimadoKg: effectiveNewWeight > 0 ? effectiveNewWeight : undefined
        };
      });`,
`    const calcWeight = !isNaN(newWeight as number) && newWeight !== undefined && newWeight > 0 ? newWeight : (pesoEstimadoCurve > 0 ? pesoEstimadoCurve : 0);
    
    // Recalculate all treatments with the calc weight
    if (tratamentos.length > 0) {
      const updated = tratamentos.map(t => {
        if (!t.doseMgKg) return { ...t, pesoEstimadoKg: newWeight };
        let mgPorDia = t.doseMgKg * calcWeight * animaisVivos;
        let produtoPorDia = mgPorDia;
        if (t.concentracao && t.concentracao > 0) {
          produtoPorDia = mgPorDia / (t.concentracao / 100);
        }
        const gramasPorDia = produtoPorDia / 1000;
        return {
          ...t,
          quantidadePorDia: Number(gramasPorDia.toFixed(2)),
          quantidadeTotal: t.duracaoDias ? Number((gramasPorDia * t.duracaoDias).toFixed(2)) : 0,
          pesoEstimadoKg: newWeight
        };
      });`
);
fs.writeFileSync('src/components/TratamentosFormSection.tsx', code);
