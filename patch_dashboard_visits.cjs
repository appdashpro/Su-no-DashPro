const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

let targetSanidade = `        const loteVisitsSanity = filteredVisits.filter(vi => vi.integradoId === v.integradoId && vi.avaliacao_tecnica);`;
let replaceSanidade = `        const loteVisitsSanity = visits.filter(vi => vi.integradoId === v.integradoId && vi.avaliacao_tecnica);`;
code = code.replace(targetSanidade, replaceSanidade);

let targetAderencia = `const loteVisits = filteredVisits.filter(vi => vi.integradoId === v.integradoId);`;
let replaceAderencia = `const loteVisits = visits.filter(vi => vi.integradoId === v.integradoId);`;
code = code.replace(targetAderencia, replaceAderencia);

fs.writeFileSync('src/components/Dashboard.tsx', code);
