const fs = require('fs');
let code = fs.readFileSync('src/components/EmpresaConfigGestao.tsx', 'utf8');

code = code.replace(
  "value={editingMedicamento.custoPorKg}",
  "value={editingMedicamento?.custoPorKg || ''}"
);
code = code.replace(
  "onChange={e => setEditingMedicamento({...editingMedicamento, custoPorKg: e.target.value})}",
  "onChange={e => editingMedicamento && setEditingMedicamento({...editingMedicamento, custoPorKg: e.target.value})}"
);
code = code.replace(
  "newMeds[targetIdx] = { nome, custoPorKg: parseFloat(editingMedicamento.custoPorKg) || 0 };",
  "newMeds[targetIdx] = { nome, custoPorKg: parseFloat(editingMedicamento?.custoPorKg || '0') || 0 };"
);

fs.writeFileSync('src/components/EmpresaConfigGestao.tsx', code);
