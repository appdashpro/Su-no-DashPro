const fs = require('fs');
let content = fs.readFileSync('src/utils/import-parser.ts', 'utf8');

// Fix 1: Map headers
content = content.replace(
  /if \(cleanH\.includes\('animaismortos'\) \|\| cleanH === 'mortos'\) map\.animaisMortos = i;/,
  `if (cleanH.includes('animaismortos') || cleanH === 'mortos') map.animaisMortos = i;
      if (cleanH.includes('descartes') || cleanH === 'descarte') map.descartesPeriodo = i;
      if (cleanH.includes('sobra') || cleanH.includes('sobrasilo')) map.sobraSiloKg = i;`
);

// Fix 2: Map to object
content = content.replace(
  /animaisMortos: parseFloatSafe\(getCol\('animaisMortos'\)\) \?\? mort,/,
  `animaisMortos: parseFloatSafe(getCol('animaisMortos')) ?? mort,
      descartesPeriodo: parseFloatSafe(getCol('descartesPeriodo')) || 0,
      sobraSiloKg: parseFloatSafe(getCol('sobraSiloKg')) || 0,`
);

fs.writeFileSync('src/utils/import-parser.ts', content);
console.log('Fixed import parser descartes');
