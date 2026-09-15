const fs = require('fs');
let code = fs.readFileSync('src/data.ts', 'utf-8');

code = code.replace(
  "      metaCrescimento3: 0,\n      metaTerminacao1: 61.2,\n      metaTerminacao2: 42.1,\n      metaTerminacao3: 70.2,",
  "      metaCrescimento3: 61.2,\n      metaTerminacao1: 42.1,\n      metaTerminacao2: 70.2,"
);

fs.writeFileSync('src/data.ts', code);
