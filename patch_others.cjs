const fs = require('fs');

function patch(path, replacements) {
  if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    for (const [search, replace] of replacements) {
      content = content.replace(search, replace);
    }
    fs.writeFileSync(path, content);
  }
}

// IntegradoDetailsModal.tsx
patch('./src/components/IntegradoDetailsModal.tsx', [
  [
    "const { curve } = getActiveCurve(lote?.alojamentoDate || visit.date, 'Em andamento', visit.tipoLote || 'Misto');",
    "const { curve } = getActiveCurve(lote?.alojamentoDate || visit.date, 'Em andamento', visit.tipoLote || 'Misto', undefined, undefined, undefined, visit.date);"
  ],
  [
    "const esperado = getExpectedConsumption(d, loteVisits[0]?.tipoLote, loteVisits[0]?.pesoAloj, lote?.alojamentoDate, lote?.status, lote?.fechamentoDate);",
    "const esperado = getExpectedConsumption(d, loteVisits[0]?.tipoLote, loteVisits[0]?.pesoAloj, lote?.alojamentoDate, lote?.status, lote?.fechamentoDate, undefined, undefined, loteVisits[0]?.date);"
  ],
  [
    "const consumoEsperado = getExpectedConsumption(visit.idade, visit.tipoLote, visit.pesoAloj, integrado?.alojamentoDate, integrado?.status, integrado?.fechamentoDate);",
    "const consumoEsperado = getExpectedConsumption(visit.idade, visit.tipoLote, visit.pesoAloj, integrado?.alojamentoDate, integrado?.status, integrado?.fechamentoDate, undefined, undefined, visit.date);"
  ]
]);

// TratamentosFormSection.tsx
patch('./src/components/TratamentosFormSection.tsx', [
  [
    "const { curve } = getActiveCurve(alojamentoDate, 'Em andamento', tipoLote);",
    "const { curve } = getActiveCurve(alojamentoDate, 'Em andamento', tipoLote, undefined, undefined, undefined, new Date().toISOString().split('T')[0]);"
  ]
]);

// MedicationAnalysis.tsx
patch('./src/components/MedicationAnalysis.tsx', [
  [
    "const { curve } = getActiveCurve(integrado.alojamentoDate || visit.date, 'Em andamento', visit.tipoLote || 'Misto');",
    "const { curve } = getActiveCurve(integrado.alojamentoDate || visit.date, 'Em andamento', visit.tipoLote || 'Misto', undefined, undefined, undefined, visit.date);"
  ]
]);

// Integrados.tsx
patch('./src/components/Integrados.tsx', [
  [
    "const expected = getExpectedConsumption(Number(i.lastVisit.idade), i.lastVisit.tipoLote, i.lastVisit.pesoAloj, i.alojamentoDate, i.status, i.fechamentoDate);",
    "const expected = getExpectedConsumption(Number(i.lastVisit.idade), i.lastVisit.tipoLote, i.lastVisit.pesoAloj, i.alojamentoDate, i.status, i.fechamentoDate, undefined, undefined, i.lastVisit.date);"
  ]
]);

// lib/priority.ts
patch('./src/lib/priority.ts', [
  [
    "const expected = getExpectedConsumption(feedAge, visitWithFeed.tipoLote, visitWithFeed.pesoAloj, integrado.alojamentoDate, integrado.status, integrado.fechamentoDate);",
    "const expected = getExpectedConsumption(feedAge, visitWithFeed.tipoLote, visitWithFeed.pesoAloj, integrado.alojamentoDate, integrado.status, integrado.fechamentoDate, undefined, undefined, visitWithFeed.date);"
  ]
]);

// utils/import-parser.ts
patch('./src/utils/import-parser.ts', [
  [
    "const { metas } = getActiveCurve(integradoMatch?.alojamentoDate, integradoMatch?.status, tipoLote, integradoMatch?.fechamentoDate);",
    "const { metas } = getActiveCurve(integradoMatch?.alojamentoDate, integradoMatch?.status, tipoLote, integradoMatch?.fechamentoDate, undefined, undefined, dateStr.split('/').reverse().join('-'));"
  ]
]);

