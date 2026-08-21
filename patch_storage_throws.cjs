const fs = require('fs');
let code = fs.readFileSync('src/lib/storage.ts', 'utf8');

code = code.replace(
  `       const { error: errVisita } = await supabase.from('visitas').upsert(visitaRow);
       if (errVisita) {
          if (isNetworkError(errVisita)) {
             addVisitsToOfflineQueue([v]);
             continue;
          } else {
             // Save to queue anyway so it's not lost on reload during schema mismatch
             addVisitsToOfflineQueue([v]);
             throw errVisita;
          }
       }`,
  `       const { error: errVisita } = await supabase.from('visitas').upsert(visitaRow);
       if (errVisita) {
          console.error("Erro upsert visita:", errVisita);
          addVisitsToOfflineQueue([v]);
          continue;
       }`
);

code = code.replace(
  `       if (errLote && !isNetworkError(errLote)) throw errLote;`,
  `       if (errLote) {
           console.error("Erro update lote:", errLote);
           addVisitsToOfflineQueue([v]);
           continue;
       }`
);

code = code.replace(
  `         if (errCargas) {
             addVisitsToOfflineQueue([v]);
             if (!isNetworkError(errCargas)) throw errCargas;
         }`,
  `         if (errCargas) {
             console.error("Erro insert cargas:", errCargas);
             addVisitsToOfflineQueue([v]);
             continue;
         }`
);

code = code.replace(
  `         if (errTratamentos) {
             addVisitsToOfflineQueue([v]);
             if (!isNetworkError(errTratamentos)) throw errTratamentos;
         }`,
  `         if (errTratamentos) {
             console.error("Erro insert tratamentos:", errTratamentos);
             addVisitsToOfflineQueue([v]);
             continue;
         }`
);

fs.writeFileSync('src/lib/storage.ts', code, 'utf8');
