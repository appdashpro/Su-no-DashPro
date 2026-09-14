const fs = require('fs');
let code = fs.readFileSync('src/components/ReferenceCurve.tsx', 'utf8');
code = code.replace(
  `{new Date(g.dataVigencia + 'T12:00:00').toLocaleDateString('pt-BR')}`,
  `{g.dataVigencia === 'Sempre' ? 'Sempre' : new Date(g.dataVigencia + 'T12:00:00').toLocaleDateString('pt-BR')}`
);
fs.writeFileSync('src/components/ReferenceCurve.tsx', code);
