const fs = require('fs');
let code = fs.readFileSync('src/lib/storage.ts', 'utf8');

code = code.replace(
  "lote?.status === 'Ativo' ? 'Em andamento' : 'Fechado'",
  "lote?.status === 'Encerrado' ? 'Fechado' : 'Em andamento'"
);

fs.writeFileSync('src/lib/storage.ts', code);
console.log("Status fallback 2 fixed!");
