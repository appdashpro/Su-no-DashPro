const fs = require('fs');
let code = fs.readFileSync('src/lib/storage.ts', 'utf8');

code = code.replace(
  "status: edit.status === 'Fechado' ? 'Encerrado' : 'Ativo'",
  "status: edit.status === 'Fechado' ? 'Encerrado' : 'Ativo',\n              data_fechamento: edit.fechamentoDate || null"
);

code = code.replace(
  "fechamentoDate: localVersion?.fechamentoDate || undefined,",
  "fechamentoDate: lote.data_fechamento || localVersion?.fechamentoDate || undefined,"
);

code = code.replace(
  "status: localLote.status === 'Fechado' ? 'Encerrado' : 'Ativo'",
  "status: localLote.status === 'Fechado' ? 'Encerrado' : 'Ativo',\n               data_fechamento: localLote.fechamentoDate || null"
);

fs.writeFileSync('src/lib/storage.ts', code);
