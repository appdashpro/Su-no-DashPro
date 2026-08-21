const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  `            empresa_id: integrado.empresaId`,
  `            ...(integrado.empresaId ? { empresa_id: integrado.empresaId } : {})`
);

fs.writeFileSync('src/App.tsx', code, 'utf8');
