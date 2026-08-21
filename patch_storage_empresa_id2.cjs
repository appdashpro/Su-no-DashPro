const fs = require('fs');
let code = fs.readFileSync('src/lib/storage.ts', 'utf8');

code = code.replace(
  `                   if (newUser) {
                       finalUserId = newUser.id;
                       finalEmpresaId = EMPRESA_ID;
                   }`,
  `                   if (newUser) {
                       finalUserId = newUser.id;
                       // DO NOT overwrite finalEmpresaId
                   }`
);

fs.writeFileSync('src/lib/storage.ts', code, 'utf8');
