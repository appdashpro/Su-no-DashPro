const fs = require('fs');
let c;

let f5 = 'src/components/VisitForm.tsx';
if (fs.existsSync(f5)) {
  c = fs.readFileSync(f5, 'utf8');
  c = c.replace(/formData\.curva_consumo_id === 'v1'/g, "String(formData.curva_consumo_id) === 'v1'");
  c = c.replace(/formData\.curva_consumo_id === 'v2'/g, "String(formData.curva_consumo_id) === 'v2'");
  c = c.replace(/Number\(formData\.curva_consumo_id\)/g, "String(formData.curva_consumo_id)");
  fs.writeFileSync(f5, c);
}
