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

patch('./src/lib/storage.ts', [
  [
    `const activeCurveInfo = getActiveCurve(
          lote?.data_alojamento,
          lote?.status === 'Ativo' ? 'Em andamento' : 'Fechado',
          lote?.tipo_lote as any, lote?.data_abate || null, null, v.curva_consumo_id
        );`,
    `const activeCurveInfo = getActiveCurve(
          lote?.data_alojamento,
          lote?.status === 'Ativo' ? 'Em andamento' : 'Fechado',
          lote?.tipo_lote as any, lote?.data_abate || null, null, v.curva_consumo_id, v.data_visita
        );`
  ]
]);

patch('./src/utils/cargill-calculations.ts', [
  [
    `const expectedConsumo = getExpectedConsumption(
    idade,
    tipoLote,
    pesoAloj,
    integrado?.alojamentoDate,
    integrado?.status,
    integrado?.fechamentoDate
  );`,
    `const expectedConsumo = getExpectedConsumption(
    idade,
    tipoLote,
    pesoAloj,
    integrado?.alojamentoDate,
    integrado?.status,
    integrado?.fechamentoDate,
    undefined,
    undefined,
    visit.date
  );`
  ]
]);

