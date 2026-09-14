const fs = require('fs');

let file = 'src/components/EmpresaConfigGestao.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  "const [tipoCalculo, setTipoCalculo] = useState<'DIA_UM' | 'PESO_ALOJAMENTO'>('DIA_UM');",
  "const [tipoCalculo, setTipoCalculo] = useState<'DIA_UM' | 'PESO_ALOJAMENTO' | 'GOMPERTZ'>('DIA_UM');\n  const [gompertzParams, setGompertzParams] = useState({ pm: 260, b: 0.012, em: 3780 });"
);

code = code.replace(
  "setTipoCalculo(activeData.tipo_calculo_curva || 'DIA_UM');",
  "setTipoCalculo(activeData.tipo_calculo_curva || 'DIA_UM');\n        if (activeData.gompertz_params) setGompertzParams(activeData.gompertz_params);"
);

code = code.replace(
  "tipo_calculo_curva: tipoCalculo,",
  "tipo_calculo_curva: tipoCalculo,\n      gompertz_params: gompertzParams,"
);

fs.writeFileSync(file, code);
