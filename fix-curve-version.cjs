const fs = require('fs');
let code = fs.readFileSync('src/data.ts', 'utf-8');

if (!code.includes('programa_alimentar?: any[];')) {
   code = code.replace(
     "    metaTerminacao2: number;\n    metaAcumulada: number;\n  }",
     "    metaTerminacao2: number;\n    metaAcumulada: number;\n  };\n  programa_alimentar?: any[];"
   );
   fs.writeFileSync('src/data.ts', code);
}
