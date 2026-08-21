const fs = require('fs');
let code = fs.readFileSync('src/lib/storage.ts', 'utf8');

code = code.replace(
  `       let finalUserId = '910e47b0-22c9-497e-9eaa-0816d7fce6d4'; // Fallback admin
       let finalEmpresaId = localLote?.empresaId || EMPRESA_ID;`,
  `       let finalUserId = '910e47b0-22c9-497e-9eaa-0816d7fce6d4'; // Fallback admin
       let finalEmpresaId = localLote?.empresaId || EMPRESA_ID;
       
       // Ensure we use the exact same DB empresa ID as the Integrado, just like we did for Lote
       if (localLote) {
           const { data: dbInts } = await supabase.from('integrados').select('empresa_id').eq('nome', localLote.name);
           if (dbInts && dbInts.length > 0 && dbInts[0].empresa_id) {
               finalEmpresaId = dbInts[0].empresa_id;
           }
       }`
);

fs.writeFileSync('src/lib/storage.ts', code, 'utf8');
