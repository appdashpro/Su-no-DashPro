import fs from 'fs';

const filePath = 'src/lib/storage.ts';
let code = fs.readFileSync(filePath, 'utf-8');

const pattern = /fechamentoDate: undefined/;
const replacement = `fechamentoDate: lote.data_abate || undefined`;

code = code.replace(pattern, replacement);

fs.writeFileSync(filePath, code, 'utf-8');
console.log("Patch 3 applied to storage.ts");
