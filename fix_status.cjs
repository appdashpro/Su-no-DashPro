const fs = require('fs');
let code = fs.readFileSync('src/lib/storage.ts', 'utf8');

code = code.replace(
  "status: localLote.status === 'Em andamento' ? 'Ativo' : 'Encerrado'",
  "status: localLote.status === 'Fechado' ? 'Encerrado' : 'Ativo'"
);

code = code.replace(
  "status: edit.status === 'Em andamento' ? 'Ativo' : 'Encerrado'",
  "status: edit.status === 'Fechado' ? 'Encerrado' : 'Ativo'"
);

// Check if mappedIntegrados is mapping correctly
code = code.replace(
  "status: lote.status === 'Ativo' ? 'Em andamento' : 'Fechado'",
  "status: lote.status === 'Encerrado' ? 'Fechado' : 'Em andamento'"
);

fs.writeFileSync('src/lib/storage.ts', code);
console.log("Status fallback fixed!");
