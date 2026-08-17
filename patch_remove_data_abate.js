import fs from 'fs';

let filePath = 'src/App.tsx';
let code = fs.readFileSync(filePath, 'utf-8');
code = code.replace(/data_abate:\s*integrado\.fechamentoDate\s*\|\|\s*null/g, '');
// there might be a trailing comma on the previous line or a leading comma on this line
// wait, we have:
/*
         status: integrado.status === 'Em andamento' ? 'Ativo' : 'Encerrado',
         data_abate: integrado.fechamentoDate || null
*/
code = code.replace(/,\s*data_abate:\s*integrado\.fechamentoDate\s*\|\|\s*null/g, '');
fs.writeFileSync(filePath, code, 'utf-8');

filePath = 'src/lib/storage.ts';
code = fs.readFileSync(filePath, 'utf-8');
code = code.replace(/,\s*data_abate:\s*edit\.fechamentoDate\s*\|\|\s*null/g, '');
code = code.replace(/,\s*data_abate:\s*localLote\.fechamentoDate\s*\|\|\s*null/g, '');

// Also, what about where we read data_abate?
code = code.replace(/fechamentoDate:\s*lote\.data_abate\s*\|\|\s*undefined/g, 'fechamentoDate: undefined');

fs.writeFileSync(filePath, code, 'utf-8');
console.log("Removed data_abate references");
