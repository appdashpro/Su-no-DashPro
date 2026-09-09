const fs = require('fs');
let code = fs.readFileSync('src/components/TratamentosFormSection.tsx', 'utf8');

code = code.replace(/R\$ \{tratamento\.custoTotal\.toFixed\(2\)\}/g, 'R$ {(tratamento.custoTotal || 0).toFixed(2)}');

fs.writeFileSync('src/components/TratamentosFormSection.tsx', code);
