const fs = require('fs');
let code = fs.readFileSync('src/components/IntegradoDetailsModal.tsx', 'utf8');

// replace integradoInfo with integrado
code = code.replace(
  "const { curve } = getActiveCurve(integradoInfo.alojamentoDate || visit.date, 'Em andamento', visit.tipoLote || 'Misto');",
  "const { curve } = getActiveCurve(integrado.alojamentoDate || visit.date, 'Em andamento', visit.tipoLote || 'Misto');"
);

// fix missing import by injecting at top
code = code.replace(
  "import { getActiveCurve } from '../data';",
  "import { getActiveCurve } from '../data';\nimport type { GrowthCurvePoint } from '../types';"
);

fs.writeFileSync('src/components/IntegradoDetailsModal.tsx', code);
