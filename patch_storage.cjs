const fs = require('fs');
let code = fs.readFileSync('src/lib/storage.ts', 'utf-8');

code = code.replace(
  /'Animais Mortos': toNum\(v\.animaisMortos\),/,
  "'Animais Mortos': toNum(v.animaisMortos),\n        'Mortalidade': toNum(v.mortalidade),"
);

fs.writeFileSync('src/lib/storage.ts', code);
console.log('patched storage.ts');
