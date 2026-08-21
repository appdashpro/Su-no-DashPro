const fs = require('fs');
let code = fs.readFileSync('src/lib/storage.ts', 'utf8');

code = code.replace(
  `           if (userProfile) {
               finalUserId = userProfile.id;
               if (userProfile.empresa_id) {
                   finalEmpresaId = userProfile.empresa_id;
               }
           } else {`,
  `           if (userProfile) {
               finalUserId = userProfile.id;
               // DO NOT OVERWRITE finalEmpresaId with userProfile.empresa_id
               // because finalEmpresaId must match the Lote's empresa_id for the FK!
           } else {`
);

fs.writeFileSync('src/lib/storage.ts', code, 'utf8');
