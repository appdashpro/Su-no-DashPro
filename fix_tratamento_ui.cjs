const fs = require('fs');
let code = fs.readFileSync('src/components/TratamentosFormSection.tsx', 'utf8');

const regex = /<span className="font-semibold text-sm">\{tratamento.quantidadeTotal\} g<\/span>/g;
code = code.replace(regex, `
                    <span className="font-semibold text-sm">{tratamento.quantidadeTotal} g</span>
                  </div>
                  {tratamento.custoTotal > 0 && (
                  <div>
                    <span className="block text-blue-600/70">Custo Total:</span>
                    <span className="font-semibold text-sm">R$ {tratamento.custoTotal}</span>
                  </div>
                  )}
`);

code = code.replace(
  "const activeMedicamentos = (medicamentosPermitidos && medicamentosPermitidos.length > 0)",
  "const activeMedicamentos: any[] = (medicamentosPermitidos && medicamentosPermitidos.length > 0)"
);

fs.writeFileSync('src/components/TratamentosFormSection.tsx', code);
console.log('TratamentosFormSection UI updated');
