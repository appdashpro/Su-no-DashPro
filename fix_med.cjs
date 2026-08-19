const fs = require('fs');

let medStr = fs.readFileSync('src/components/MedicationAnalysis.tsx', 'utf8');

medStr = medStr.replace(
  `      let pesoEstimadoKg = visit.pesoAmostradoKg || 0;
      if (pesoEstimadoKg <= 0) {
        const { curve } = getActiveCurve(integrado.alojamentoDate || visit.date, 'Em andamento', visit.tipoLote || 'Misto');
        const expectedPoint = curve.find((p: GrowthCurvePoint) => p.dia >= (visit.idade || 0));
        pesoEstimadoKg = expectedPoint ? expectedPoint.pesoInicial : 0;
      }`,
  `      let basePesoEstimadoKg = visit.pesoAmostradoKg || 0;
      if (basePesoEstimadoKg <= 0) {
        const { curve } = getActiveCurve(integrado.alojamentoDate || visit.date, 'Em andamento', visit.tipoLote || 'Misto');
        const expectedPoint = curve.find((p: GrowthCurvePoint) => p.dia >= (visit.idade || 0));
        basePesoEstimadoKg = expectedPoint ? expectedPoint.pesoInicial : 0;
      }`
);

medStr = medStr.replace(
  `      visit.tratamentos.forEach(t => {
        if (!t.produto) return;
        
        const concentracao = t.concentracao && t.concentracao > 0 ? t.concentracao : 100;
        const duracaoDias = t.duracaoDias || 1;
        const doseMgKg = t.doseMgKg || 0;`,
  `      visit.tratamentos.forEach(t => {
        if (!t.produto) return;
        
        let pesoEstimadoKg = t.pesoEstimadoKg || basePesoEstimadoKg;
        
        const concentracao = t.concentracao && t.concentracao > 0 ? t.concentracao : 100;
        const duracaoDias = t.duracaoDias || 1;
        const doseMgKg = t.doseMgKg || 0;`
);

fs.writeFileSync('src/components/MedicationAnalysis.tsx', medStr);

