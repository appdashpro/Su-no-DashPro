const fs = require('fs');

let content = fs.readFileSync('src/lib/storage.ts', 'utf8');

const target = `const { error: errVisita } = await supabase.from('visitas').upsert(visitaRow);
       if (errVisita) {
          if (isNetworkError(errVisita)) addVisitsToOfflineQueue([v]);
          continue;
       }`;

const newTarget = `const { error: errVisita } = await supabase.from('visitas').upsert(visitaRow);
       if (errVisita) {
          if (isNetworkError(errVisita)) {
             addVisitsToOfflineQueue([v]);
             continue;
          }
          throw errVisita;
       }`;

content = content.replace(target, newTarget);
fs.writeFileSync('src/lib/storage.ts', content);
console.log("Updated to throw errVisita");
