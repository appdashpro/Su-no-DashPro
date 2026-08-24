const fs = require('fs');
let code = fs.readFileSync('src/lib/storage.ts', 'utf8');

code = code.replace(
  "const toProcess = visitsToSyncToSupabase || visits;\n    \n    for (const v of toProcess) {\n       const loteId = v.integradoId;",
  "const toProcess = visitsToSyncToSupabase || visits;\n    \n    for (const v of toProcess) {\n      try {\n       const loteId = v.integradoId;"
);

code = code.replace(
  `        const { error: errTratamentos } = await supabase.from('tratamentos').insert(tratamentosToInsert);
         if (errTratamentos) {
             console.error("Erro insert tratamentos:", errTratamentos);
             addVisitsToOfflineQueue([v]);
             continue;
         }
       }
    }
    return visits;`,
  `        const { error: errTratamentos } = await supabase.from('tratamentos').insert(tratamentosToInsert);
         if (errTratamentos) {
             console.error("Erro insert tratamentos:", errTratamentos);
             addVisitsToOfflineQueue([v]);
             continue;
         }
       }
      } catch (loopErr) {
         console.error("Exception processing visit in saveVisits:", loopErr);
         addVisitsToOfflineQueue([v]);
      }
    }
    return visits;`
);

fs.writeFileSync('src/lib/storage.ts', code);
