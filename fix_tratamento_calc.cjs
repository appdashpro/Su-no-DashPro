const fs = require('fs');
let code = fs.readFileSync('src/components/TratamentosFormSection.tsx', 'utf8');

const regex = /let mgPorDia = t\.doseMgKg \* effectiveWeight \* animaisVivos;/g;
code = code.replace(regex, `
      // Dose is mg per kg of body weight.
      // Total mg per day = dose * weight * animals
      let mgPorDia = t.doseMgKg * effectiveWeight * animaisVivos;
      let custoPorKgProduto = 0;
      
      const medPermitidos = activeMedicamentos;
      if (t.produto && medPermitidos) {
        const foundMed = medPermitidos.find((m: any) => (typeof m === 'string' ? m : m.nome) === t.produto);
        if (foundMed && typeof foundMed !== 'string' && foundMed.custoPorKg) {
          custoPorKgProduto = foundMed.custoPorKg;
        }
      }
`);

// Also do it for the initial load map
const regex2 = /let mgPorDia = t\.doseMgKg \* calcWeight \* animaisVivos;/g;
code = code.replace(regex2, `
        let mgPorDia = t.doseMgKg * calcWeight * animaisVivos;
        let custoPorKgProduto = 0;
        
        const medPermitidos = activeMedicamentos;
        if (t.produto && medPermitidos) {
          const foundMed = medPermitidos.find((m: any) => (typeof m === 'string' ? m : m.nome) === t.produto);
          if (foundMed && typeof foundMed !== 'string' && foundMed.custoPorKg) {
            custoPorKgProduto = foundMed.custoPorKg;
          }
        }
`);

code = code.replace(
  "newTratamentos[index].quantidadeTotal = Number((gramasPorDia * t.duracaoDias).toFixed(2));",
  "newTratamentos[index].quantidadeTotal = Number((gramasPorDia * t.duracaoDias).toFixed(2));\n        newTratamentos[index].custoTotal = Number(((gramasPorDia * t.duracaoDias / 1000) * custoPorKgProduto).toFixed(2));"
);

code = code.replace(
  "newTratamentos[index].quantidadeTotal = 0;",
  "newTratamentos[index].quantidadeTotal = 0;\n        newTratamentos[index].custoTotal = 0;"
);

code = code.replace(
  "return { ...t, quantidadePorDia: Number(gramasPorDia.toFixed(2)), quantidadeTotal: Number((gramasPorDia * t.duracaoDias).toFixed(2)) };",
  "return { ...t, quantidadePorDia: Number(gramasPorDia.toFixed(2)), quantidadeTotal: Number((gramasPorDia * t.duracaoDias).toFixed(2)), custoTotal: Number(((gramasPorDia * t.duracaoDias / 1000) * custoPorKgProduto).toFixed(2)) };"
);

fs.writeFileSync('src/components/TratamentosFormSection.tsx', code);
console.log('TratamentosFormSection calc updated');
