const fs = require('fs');
let code = fs.readFileSync('src/lib/storage.ts', 'utf8');

const migrationCode = `
      // Auto-migrate local fechamentoDate to Supabase
      const toUpdate = mappedIntegrados.filter(i => i.status === 'Fechado' && i.fechamentoDate && !lotesDB?.find(l => l.id === i.id)?.data_fechamento);
      if (toUpdate.length > 0) {
          for (const l of toUpdate) {
              supabase.from('lotes').update({ data_fechamento: l.fechamentoDate }).eq('id', l.id).then();
          }
      }

      // Ensure any lote_id referenced in visitasDB`;

code = code.replace("// Ensure any lote_id referenced in visitasDB", migrationCode);

fs.writeFileSync('src/lib/storage.ts', code);
