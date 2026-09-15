const fs = require('fs');

let f4 = 'src/components/EmpresaConfigGestao.tsx';
if (fs.existsSync(f4)) {
  let c = fs.readFileSync(f4, 'utf8');
  c = c.replace(/em: Number\(e\.target\.value\) === '' \? '' : parseInt\(e\.target\.value\)/g, "em: parseInt(e.target.value) || 0");
  c = c.replace(/newFases\[idx\]\.duracaoDias = e\.target\.value === '' \? '' : parseInt\(e\.target\.value\);/g, "newFases[idx].duracaoDias = e.target.value === '' ? 0 : parseInt(e.target.value);");
  fs.writeFileSync(f4, c);
}

let f5 = 'src/components/VisitForm.tsx';
if (fs.existsSync(f5)) {
  let c = fs.readFileSync(f5, 'utf8');
  c = c.replace(/formData\.curva_consumo_id === 'v1'/g, "String(formData.curva_consumo_id) === 'v1'");
  c = c.replace(/formData\.curva_consumo_id === 'v2'/g, "String(formData.curva_consumo_id) === 'v2'");
  c = c.replace(/Number\(formData\.curva_consumo_id\)/g, "String(formData.curva_consumo_id)");
  fs.writeFileSync(f5, c);
}
