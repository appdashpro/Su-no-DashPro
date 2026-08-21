const fs = require('fs');
let code = fs.readFileSync('src/lib/storage.ts', 'utf8');

code = code.replace(
  `           if (dbLote.data?.animais_alojados && dbLote.data.animais_alojados > 0) {
               const isVisitaAlojamento = (localLote.alojamentoDate === v.date || v.idade === 0);
               if (!(isVisitaAlojamento && finalAloj > 0 && finalAloj !== 100 && finalAloj !== 500 && finalAloj !== 550)) {
                   finalAloj = dbLote.data.animais_alojados;
               }
            }`,
  `           if (dbLote.data?.animais_alojados && dbLote.data.animais_alojados > 0) {
               const isVisitaAlojamento = (localLote.alojamentoDate === v.date || v.idade === 0);
               if (!(isVisitaAlojamento && finalAloj > 0 && finalAloj !== 100 && finalAloj !== 500 && finalAloj !== 550)) {
                   finalAloj = dbLote.data.animais_alojados;
               }
            }
            if (finalAloj <= 0) finalAloj = 1;`
);

code = code.replace(
  `              if (dbLote2.data?.animais_alojados && dbLote2.data.animais_alojados > 0) {
           const isVisitaAlojamento2 = (localLote?.alojamentoDate === v.date || v.idade === 0);
           if (!(isVisitaAlojamento2 && finalAloj2 > 0 && finalAloj2 !== 100 && finalAloj2 !== 500 && finalAloj2 !== 550)) {
               finalAloj2 = dbLote2.data.animais_alojados;
           }
       }`,
  `              if (dbLote2.data?.animais_alojados && dbLote2.data.animais_alojados > 0) {
           const isVisitaAlojamento2 = (localLote?.alojamentoDate === v.date || v.idade === 0);
           if (!(isVisitaAlojamento2 && finalAloj2 > 0 && finalAloj2 !== 100 && finalAloj2 !== 500 && finalAloj2 !== 550)) {
               finalAloj2 = dbLote2.data.animais_alojados;
           }
       }
       if (finalAloj2 <= 0) finalAloj2 = 1;`
);

fs.writeFileSync('src/lib/storage.ts', code, 'utf8');
