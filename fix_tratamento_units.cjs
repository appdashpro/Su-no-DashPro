const fs = require('fs');
let code = fs.readFileSync('src/components/TratamentosFormSection.tsx', 'utf8');

code = code.replace(
  "newTratamentos[index].quantidadeTotal = Number((gramasPorDia * t.duracaoDias).toFixed(2));",
  "newTratamentos[index].quantidadeTotal = Number((gramasPorDia * t.duracaoDias / 1000).toFixed(4));"
);

code = code.replace(
  "return { ...t, quantidadePorDia: Number(gramasPorDia.toFixed(2)), quantidadeTotal: Number((gramasPorDia * t.duracaoDias).toFixed(2)), custoTotal: Number(((gramasPorDia * t.duracaoDias / 1000) * custoPorKgProduto).toFixed(2)) };",
  "return { ...t, quantidadePorDia: Number((gramasPorDia / 1000).toFixed(4)), quantidadeTotal: Number((gramasPorDia * t.duracaoDias / 1000).toFixed(4)), custoTotal: Number(((gramasPorDia * t.duracaoDias / 1000) * custoPorKgProduto).toFixed(2)) };"
);

code = code.replace(
  /<span className="block text-blue-600\/70">Quantidade \(g\/dia\):<\/span>\s*<span className="font-semibold text-sm">\{tratamento.quantidadePorDia\} g<\/span>/s,
  '<span className="block text-blue-600/70">Quantidade (kg/dia):</span>\n                    <span className="font-semibold text-sm">{tratamento.quantidadePorDia} kg</span>'
);

code = code.replace(
  /<span className="block text-blue-600\/70">Total Tratamento:<\/span>\s*<span className="font-semibold text-sm">\{tratamento.quantidadeTotal\} g<\/span>/s,
  '<span className="block text-blue-600/70">Total Tratamento:</span>\n                    <span className="font-semibold text-sm">{tratamento.quantidadeTotal} kg</span>'
);

fs.writeFileSync('src/components/TratamentosFormSection.tsx', code);
console.log('Fixed units in TratamentosFormSection');
