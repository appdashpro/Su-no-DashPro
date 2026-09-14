const fs = require('fs');

let file = 'src/types.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  "tipoCalculo: 'DIA_UM' | 'PESO_ALOJAMENTO';",
  "tipoCalculo: 'DIA_UM' | 'PESO_ALOJAMENTO' | 'GOMPERTZ';"
);
code = code.replace(
  "tipo_calculo_curva: 'DIA_UM' | 'PESO_ALOJAMENTO';",
  "tipo_calculo_curva: 'DIA_UM' | 'PESO_ALOJAMENTO' | 'GOMPERTZ';\n  gompertz_params?: { pm: number; b: number; em: number; };"
);

fs.writeFileSync(file, code);
