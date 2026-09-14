const fs = require('fs');
let code = fs.readFileSync('src/data.ts', 'utf8');

code = code.replace(
  /const fases = empresaConfig\?\.programa_alimentar \|\| \[\];/,
  `const pData = empresaConfig?.curva_desempenho?.find?.((c: any) => c._type === 'PROGRAMA_ALIMENTAR');
    const fases = pData?.fases || empresaConfig?.programa_alimentar || [];`
);

fs.writeFileSync('src/data.ts', code);
