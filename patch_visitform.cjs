const fs = require('fs');
const path = './src/components/VisitForm.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "const { metas } = getActiveCurve(integrado?.alojamentoDate, integrado?.status, initialData.tipoLote || 'Misto', integrado?.fechamentoDate);",
  "const { metas } = getActiveCurve(integrado?.alojamentoDate, integrado?.status, initialData.tipoLote || 'Misto', integrado?.fechamentoDate, undefined, undefined, initialData.date);"
);

content = content.replace(
  "const { metas } = getActiveCurve(activeAlojDate, undefined, activeTipo);",
  "const { metas } = getActiveCurve(activeAlojDate, undefined, activeTipo, undefined, undefined, undefined, formData.date);"
);

content = content.replace(
  "const activeCurve = getActiveCurve(integrado?.alojamentoDate, integrado?.status, formData.tipoLote as any, integrado?.fechamentoDate, currentConfig, initialData?.curva_consumo_id);",
  "const activeCurve = getActiveCurve(integrado?.alojamentoDate, integrado?.status, formData.tipoLote as any, integrado?.fechamentoDate, currentConfig, initialData?.curva_consumo_id, formData.date);"
);

content = content.replace(
  "const expectedConsumption = currentIdade > 0 ? getExpectedConsumption(currentIdade, formData.tipoLote as any, formData.pesoAloj, integrado?.alojamentoDate, integrado?.status, integrado?.fechamentoDate, currentConfig, resolvedCurvaId) : null;",
  "const expectedConsumption = currentIdade > 0 ? getExpectedConsumption(currentIdade, formData.tipoLote as any, formData.pesoAloj, integrado?.alojamentoDate, integrado?.status, integrado?.fechamentoDate, currentConfig, resolvedCurvaId, formData.date) : null;"
);

content = content.replace(
  "const expectedWeight = currentIdade > 0 ? getExpectedWeight(currentIdade, formData.tipoLote as any, formData.pesoAloj, integrado?.alojamentoDate, integrado?.status, integrado?.fechamentoDate, currentConfig, resolvedCurvaId) : null;",
  "const expectedWeight = currentIdade > 0 ? getExpectedWeight(currentIdade, formData.tipoLote as any, formData.pesoAloj, integrado?.alojamentoDate, integrado?.status, integrado?.fechamentoDate, currentConfig, resolvedCurvaId, formData.date) : null;"
);

content = content.replace(
  "consumoAcumulado: getExpectedConsumption(d, formData.tipoLote as any, formData.pesoAloj, integrado?.alojamentoDate, integrado?.status, integrado?.fechamentoDate)",
  "consumoAcumulado: getExpectedConsumption(d, formData.tipoLote as any, formData.pesoAloj, integrado?.alojamentoDate, integrado?.status, integrado?.fechamentoDate, undefined, undefined, formData.date)"
);

content = content.replace(
  "const prevExpected = getExpectedConsumption(prevIdade, prevVisit.tipoLote || formData.tipoLote as any, prevVisit.pesoAloj || formData.pesoAloj, integrado?.alojamentoDate, integrado?.status, integrado?.fechamentoDate);",
  "const prevExpected = getExpectedConsumption(prevIdade, prevVisit.tipoLote || formData.tipoLote as any, prevVisit.pesoAloj || formData.pesoAloj, integrado?.alojamentoDate, integrado?.status, integrado?.fechamentoDate, undefined, undefined, prevVisit.date);"
);


fs.writeFileSync(path, content);
