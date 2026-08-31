const fs = require('fs');

function fixFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Dashboard
  if (file.includes('Dashboard')) {
     content = content.replace(
       /let previousCurveDate = '2000-01-01';\s+if \(chartConfig\?.curva_desempenho[\s\S]*?previousCurveDate = sorted\[0\].dataVigencia;\s+\}/,
       `let previousCurveDate = '2000-01-01';
      let latestCurveDate = '2099-01-01';
      if (chartConfig?.curva_desempenho && Array.isArray(chartConfig.curva_desempenho) && chartConfig.curva_desempenho.length > 0) {
        const sorted = [...chartConfig.curva_desempenho].sort((a: any, b: any) => a.dataVigencia.localeCompare(b.dataVigencia));
        previousCurveDate = sorted[0].dataVigencia;
        latestCurveDate = sorted[sorted.length - 1].dataVigencia;
      }`
     );
     // replace dDateStr with latestCurveDate for expected
     content = content.replace(
       /const expected = getExpectedConsumption\([\s\S]*?undefined,\s+dDateStr\s+\);/,
       `const expected = getExpectedConsumption(
        idade, 
        dominantTipoLote, 
        avgPesoAloj, 
        singleAlojamentoDate, 
        singleStatus, 
        singleFechamentoDate,
        chartConfig,
        undefined,
        latestCurveDate
      );`
     );
  }
  
  // LoteReportModal & LoteReportTemplate
  if (file.includes('LoteReport')) {
     content = content.replace(
       /let previousCurveDate = '2000-01-01';\s+if \(currentConfig\?.curva_desempenho[\s\S]*?previousCurveDate = sorted\[0\].dataVigencia; \/\/ The very first curve\s+\}/,
       `let previousCurveDate = '2000-01-01';
  let latestCurveDate = '2099-01-01';
  if (currentConfig?.curva_desempenho && Array.isArray(currentConfig.curva_desempenho) && currentConfig.curva_desempenho.length > 0) {
    const sorted = [...currentConfig.curva_desempenho].sort((a: any, b: any) => a.dataVigencia.localeCompare(b.dataVigencia));
    previousCurveDate = sorted[0].dataVigencia; // The very first curve
    latestCurveDate = sorted[sorted.length - 1].dataVigencia; // The newest curve
  }`
     );
     
     content = content.replace(
       /const esperado = getExpectedConsumption\((.*?), undefined, dDateStr\);/g,
       `const esperado = getExpectedConsumption($1, undefined, latestCurveDate);`
     );
  }

  fs.writeFileSync(file, content);
}

fixFile('src/components/Dashboard.tsx');
fixFile('src/components/LoteReportModal.tsx');
fixFile('src/components/LoteReportTemplate.tsx');

