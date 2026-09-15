const fs = require('fs');
let c;

let f4 = 'src/components/EmpresaConfigGestao.tsx';
if (fs.existsSync(f4)) {
  c = fs.readFileSync(f4, 'utf8');
  c = c.replace(/em: Number\(e\.target\.value\) === '' \? '' : parseFloat\(e\.target\.value\)/g, "em: parseFloat(e.target.value) || 0");
  c = c.replace(/Number\(e\.target\.value\) === '' \? '' : parseFloat\(e\.target\.value\)/g, "parseFloat(e.target.value) || 0");
  c = c.replace(/e\.target\.value === '' \? '' : parseFloat\(e\.target\.value\)/g, "parseFloat(e.target.value) || 0");
  fs.writeFileSync(f4, c);
}

let f5 = 'src/components/VisitForm.tsx';
if (fs.existsSync(f5)) {
  c = fs.readFileSync(f5, 'utf8');
  c = c.replace(/formData\.curva_consumo_id === 'v1'/g, "String(formData.curva_consumo_id) === 'v1'");
  c = c.replace(/formData\.curva_consumo_id === 'v2'/g, "String(formData.curva_consumo_id) === 'v2'");
  fs.writeFileSync(f5, c);
}
