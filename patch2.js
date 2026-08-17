import fs from 'fs';

const filePath = 'src/App.tsx';
let code = fs.readFileSync(filePath, 'utf-8');

const pattern = /status: integrado\.status === 'Em andamento' \? 'Ativo' : 'Fechado'/;
const replacement = `status: integrado.status === 'Em andamento' ? 'Ativo' : 'Encerrado',
   data_abate: integrado.fechamentoDate || null`;

code = code.replace(pattern, replacement);

fs.writeFileSync(filePath, code, 'utf-8');
console.log("Patch 2 applied to App.tsx");
