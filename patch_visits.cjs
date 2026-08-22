const fs = require('fs');
const path = './src/components/Visits.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "const expected = getExpectedConsumption(v.idade, v.tipoLote, v.pesoAloj, integrado?.alojamentoDate, integrado?.status, integrado?.fechamentoDate);",
  "const expected = getExpectedConsumption(v.idade, v.tipoLote, v.pesoAloj, integrado?.alojamentoDate, integrado?.status, integrado?.fechamentoDate, undefined, undefined, v.date);"
);

content = content.replace(
  "const activeCurveInfo = getActiveCurve(integrado?.alojamentoDate, integrado?.status, v.tipoLote, integrado?.fechamentoDate);",
  "const activeCurveInfo = getActiveCurve(integrado?.alojamentoDate, integrado?.status, v.tipoLote, integrado?.fechamentoDate, undefined, undefined, v.date);"
);

fs.writeFileSync(path, content);
