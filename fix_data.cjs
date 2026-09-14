const fs = require('fs');
let code = fs.readFileSync('src/data.ts', 'utf8');

code = code.replace(
  /const pm = empresaConfig\?\.gompertz_params\?\.pm \|\| 260;/g,
  `const gParams = empresaConfig?.curva_desempenho?.find?.((c: any) => c._type === 'GOMPERTZ_PARAMS');
    const pm = empresaConfig?.gompertz_params?.pm || gParams?.pm || 260;`
);

code = code.replace(
  /const b = empresaConfig\?\.gompertz_params\?\.b \|\| 0\.012;/g,
  `const b = empresaConfig?.gompertz_params?.b || gParams?.b || 0.012;`
);

code = code.replace(
  /const em = empresaConfig\?\.gompertz_params\?\.em \|\| 3780;/g,
  `const em = empresaConfig?.gompertz_params?.em || gParams?.em || 3780;`
);

fs.writeFileSync('src/data.ts', code);
