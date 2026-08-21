const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  `const newIntegrado: Integrado = {
     id: newVisit.integradoId,
     name: integradoNome,
     alojamentoDate,
     status: 'Em andamento',
     empresaId: empresaId || undefined
   };`,
  `const empresaFound = empresaId ? empresas.find(e => e.id === empresaId) : undefined;
   const newIntegrado: Integrado = {
     id: newVisit.integradoId,
     name: integradoNome,
     alojamentoDate,
     status: 'Em andamento',
     empresaId: empresaId || undefined,
     empresaName: empresaFound ? empresaFound.nome : undefined
   };`
);

code = code.replace(
  `const updatedIntegrados = integrados.map(i => i.id === existing.id ? { ...i, name: integradoNome, alojamentoDate, empresaId: empresaId || i.empresaId } : i);`,
  `const empresaFound = empresaId ? empresas.find(e => e.id === empresaId) : undefined;
   const updatedIntegrados = integrados.map(i => i.id === existing.id ? { ...i, name: integradoNome, alojamentoDate, empresaId: empresaId || i.empresaId, empresaName: empresaFound ? empresaFound.nome : i.empresaName } : i);`
);

fs.writeFileSync('src/App.tsx', code, 'utf8');
