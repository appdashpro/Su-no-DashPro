const fs = require('fs');
let code = fs.readFileSync('src/lib/storage.ts', 'utf8');

code = code.replace(
  "concentracao: t.concentracao || null,",
  "concentracao: t.concentracao || null,\n            custo_total: t.custoTotal || null,"
);

fs.writeFileSync('src/lib/storage.ts', code);
