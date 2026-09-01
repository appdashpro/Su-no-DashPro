const fs = require('fs');
let code = fs.readFileSync('src/components/EntregasFormSection.tsx', 'utf8');

code = code.replace(
  "import { generateUUID } from '../lib/idGenerator';",
  ""
);

code = code.replace(
  "onChange([...entregas, { id: generateUUID(), produto_id: '', quantidade: 1, valor_unitario_aplicado: 0 }]);",
  "onChange([...entregas, { id: crypto.randomUUID(), produto_id: '', quantidade: 1, valor_unitario_aplicado: 0 }]);"
);

fs.writeFileSync('src/components/EntregasFormSection.tsx', code);
