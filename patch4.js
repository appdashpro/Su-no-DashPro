import fs from 'fs';

const filePath = 'src/lib/storage.ts';
let code = fs.readFileSync(filePath, 'utf-8');

const pattern = /status: localLote\.status === 'Em andamento' \? 'Ativo' : 'Encerrado'/;
const replacement = `status: localLote.status === 'Em andamento' ? 'Ativo' : 'Encerrado',
                data_abate: localLote.fechamentoDate || null`;

code = code.replace(pattern, replacement);

fs.writeFileSync(filePath, code, 'utf-8');
console.log("Patch 4 applied to storage.ts");
