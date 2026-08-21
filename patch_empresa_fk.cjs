const fs = require('fs');
let code = fs.readFileSync('src/lib/storage.ts', 'utf8');

code = code.replace(
  `           const targetEmpresaId = localLote.empresaId || EMPRESA_ID;

           // We try to upsert the Integrado and Lote to prevent Foreign Key errors
           const { data: existingIntegrados } = await supabase.from('integrados').select('id').eq('nome', localLote.name);
           let dbIntegradoId = existingIntegrados && existingIntegrados.length > 0 ? existingIntegrados[0].id : crypto.randomUUID();`,
  `           let targetEmpresaId = localLote.empresaId || EMPRESA_ID;

           // We try to upsert the Integrado and Lote to prevent Foreign Key errors
           const { data: existingIntegrados } = await supabase.from('integrados').select('id, empresa_id').eq('nome', localLote.name);
           let dbIntegradoId = existingIntegrados && existingIntegrados.length > 0 ? existingIntegrados[0].id : crypto.randomUUID();
           if (existingIntegrados && existingIntegrados.length > 0 && existingIntegrados[0].empresa_id) {
               targetEmpresaId = existingIntegrados[0].empresa_id;
           }`
);

fs.writeFileSync('src/lib/storage.ts', code, 'utf8');
