const fs = require('fs');
let code = fs.readFileSync('src/components/ReferenceCurve.tsx', 'utf-8');
code = code.replace(
  "  const availableSexesForGroup = currentGroupKey \n    ? curvas.filter(c => c.dataVigencia === currentGroupKey).filter((c, index, self) => index === self.findIndex((t) => (t.tipoLote || 'Misto') === (c.tipoLote || 'Misto')))\n    : [];",
  "  const availableSexesForGroup = currentGroupKey \n    ? curvas.filter(c => c.dataVigencia === currentGroupKey).filter((c, index, self) => index === self.findIndex((t) => String(t.tipoLote || 'Misto').normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase() === String(c.tipoLote || 'Misto').normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase()))\n    : [];"
);
fs.writeFileSync('src/components/ReferenceCurve.tsx', code);
