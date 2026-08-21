const fs = require('fs');
let code = fs.readFileSync('src/lib/storage.ts', 'utf8');

code = code.replace(
  `               await supabase.from('integrados').upsert({
                   id: dbIntegradoId,
                   empresa_id: targetEmpresaId,
                   nome: localLote.name,
                   ativo: true
               });`,
  `               const { error: errInt } = await supabase.from('integrados').upsert({
                   id: dbIntegradoId,
                   empresa_id: targetEmpresaId,
                   nome: localLote.name,
                   ativo: true
               });
               if (errInt) console.error("Error upserting integrado:", errInt);`
);

code = code.replace(
  `            await supabase.from('lotes').upsert({
                id: loteId,
                empresa_id: targetEmpresaId,
                integrado_id: dbIntegradoId,
                data_alojamento: localLote.alojamentoDate || v.date,
                animais_alojados: finalAloj,
               peso_alojamento_kg: v.pesoAloj || 0,
               tipo_lote: v.tipoLote || 'Misto',
               status: localLote.status === 'Em andamento' ? 'Ativo' : 'Encerrado'
           });`,
  `            const { error: errLote } = await supabase.from('lotes').upsert({
                id: loteId,
                empresa_id: targetEmpresaId,
                integrado_id: dbIntegradoId,
                data_alojamento: localLote.alojamentoDate || v.date,
                animais_alojados: finalAloj,
               peso_alojamento_kg: v.pesoAloj || 0,
               tipo_lote: v.tipoLote || 'Misto',
               status: localLote.status === 'Em andamento' ? 'Ativo' : 'Encerrado'
           });
           if (errLote) console.error("Error upserting lote:", errLote);`
);

fs.writeFileSync('src/lib/storage.ts', code, 'utf8');
