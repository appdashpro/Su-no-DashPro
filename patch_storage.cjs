const fs = require('fs');
let code = fs.readFileSync('src/lib/storage.ts', 'utf8');

code = code.replace(
`      if (parseQueueSafe(OFFLINE_QUEUE_KEY).length > 0) {
          window.dispatchEvent(new Event('sync-completed'));
          throw new Error("Alguns lançamentos pendentes falharam ao sincronizar. Eles continuarão salvos offline para tentativa futura.");
      }`,
`      if (parseQueueSafe(OFFLINE_QUEUE_KEY).length > 0) {
          console.warn("Alguns lançamentos pendentes falharam ao sincronizar. Eles continuarão salvos offline para tentativa futura.");
      }`
);

fs.writeFileSync('src/lib/storage.ts', code);
