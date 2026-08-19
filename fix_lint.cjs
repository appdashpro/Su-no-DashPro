const fs = require('fs');
let code = fs.readFileSync('src/components/IntegradoDetailsModal.tsx', 'utf8');

code = code.replace(
  "const { curve } = getActiveCurve(integrado.alojamentoDate || visit.date, 'Em andamento', visit.tipoLote || 'Misto');",
  "const { curve } = getActiveCurve(integradoInfo.alojamentoDate || visit.date, 'Em andamento', visit.tipoLote || 'Misto');"
);

// GrowthCurvePoint import
code = code.replace(
  "import { getActiveCurve } from '../data';",
  "import { getActiveCurve } from '../data';\nimport { GrowthCurvePoint } from '../types';"
);

fs.writeFileSync('src/components/IntegradoDetailsModal.tsx', code);
