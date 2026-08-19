const fs = require('fs');
let code = fs.readFileSync('src/components/TratamentosFormSection.tsx', 'utf8');

code = code.replace(
  "quantidadeTotal: t.duracaoDias ? Number((gramasPorDia * t.duracaoDias).toFixed(2)) : 0",
  "quantidadeTotal: t.duracaoDias ? Number((gramasPorDia * t.duracaoDias).toFixed(2)) : 0,\n          pesoEstimadoKg: effectiveNewWeight"
);

code = code.replace(
  "quantidadeTotal: duracaoDias ? Number((gramasPorDia * duracaoDias).toFixed(2)) : 0",
  "quantidadeTotal: duracaoDias ? Number((gramasPorDia * duracaoDias).toFixed(2)) : 0,\n      pesoEstimadoKg: effectiveWeight"
);

fs.writeFileSync('src/components/TratamentosFormSection.tsx', code);
