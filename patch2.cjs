const fs = require('fs');
let code = fs.readFileSync('src/lib/storage.ts', 'utf8');

code = code.replace(
  `       const { error: errLote } = await supabase.from('lotes').update({
         animais_alojados: finalAloj2,`,
  `       if (finalAloj2 <= 0) finalAloj2 = 1;
       const { error: errLote } = await supabase.from('lotes').update({
         animais_alojados: finalAloj2,`
);

fs.writeFileSync('src/lib/storage.ts', code, 'utf8');
