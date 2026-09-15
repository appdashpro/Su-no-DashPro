const fs = require('fs');
let code = fs.readFileSync('src/data.ts', 'utf-8');

code = code.replace(
  "    version: 'copagri',\n    effectiveDate: '2026-04-01',\n    metas: {\n      metaAlojamento: 18.4,\n      metaCrescimento1: 44.2,\n      metaCrescimento2: 31.1,\n      metaCrescimento3: 61.2,\n      metaTerminacao1: 42.1,\n      metaTerminacao2: 70.2,",
  "    version: 'copagri',\n    effectiveDate: '2026-04-01',\n    metas: {\n      metaAlojamento: 18.4,\n      metaCrescimento1: 44.2,\n      metaCrescimento2: 31.1,\n      metaCrescimento3: 0,\n      metaTerminacao1: 61.2,\n      metaTerminacao2: 42.1,\n      metaTerminacao3: 70.2,"
);

fs.writeFileSync('src/data.ts', code);
