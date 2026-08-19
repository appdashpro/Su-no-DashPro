const fs = require('fs');
let code = fs.readFileSync('src/components/IntegradoDetailsModal.tsx', 'utf8');

// replace integrado.alojamentoDate with lote?.alojamentoDate
code = code.replace(
  "const { curve } = getActiveCurve(integrado.alojamentoDate || visit.date, 'Em andamento', visit.tipoLote || 'Misto');",
  "const { curve } = getActiveCurve(lote?.alojamentoDate || visit.date, 'Em andamento', visit.tipoLote || 'Misto');"
);

fs.writeFileSync('src/components/IntegradoDetailsModal.tsx', code);
