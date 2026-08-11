const fs = require('fs');

let content = fs.readFileSync('src/components/VisitForm.tsx', 'utf8');

// Insert dynamicChartData after expectedWeight
if (!content.includes('const dynamicChartData = useMemo')) {
  const insertIndex = content.indexOf('const currentConsumoReal');
  const codeToInsert = `  const dynamicChartData = React.useMemo(() => {
    if (currentIdade <= 0) return [];
    const data = [];
    const maxDays = Math.min(150, currentIdade + 10);
    for (let d = 1; d <= maxDays; d++) {
      data.push({
        dia: d,
        consumoAcumulado: getExpectedConsumption(d, formData.tipoLote as any, formData.pesoAloj)
      });
    }
    return data;
  }, [currentIdade, formData.tipoLote, formData.pesoAloj]);

  `;
  content = content.substring(0, insertIndex) + codeToInsert + content.substring(insertIndex);
}

// Replace LineChart data
content = content.replace(
  /<LineChart data=\{growthCurve\.slice\(0, Math\.min\(growthCurve\.length, currentIdade \+ 10\)\)\} /g,
  '<LineChart data={dynamicChartData} '
);

fs.writeFileSync('src/components/VisitForm.tsx', content);
console.log("Patched VisitForm chart logic");
