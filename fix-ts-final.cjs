const fs = require('fs');
let c;

let f1 = 'src/components/CopagriMigration.tsx';
if (fs.existsSync(f1)) {
  c = fs.readFileSync(f1, 'utf8');
  c = c.replace(/!\(\(c: any\) => c\.id/g, "!currentCurvas.find((c: any) => c.id");
  c = c.replace(/!currentCurvas\.find\(c => c\.id/g, "!currentCurvas.find((c: any) => c.id");
  fs.writeFileSync(f1, c);
}

let f2 = 'src/components/CopagriUpdate.tsx';
if (fs.existsSync(f2)) {
  c = fs.readFileSync(f2, 'utf8');
  c = c.replace(/!\(\(c: any\) => c\.id/g, "!currentCurvas.find((c: any) => c.id");
  c = c.replace(/!currentCurvas\.find\(c => c\.id/g, "!currentCurvas.find((c: any) => c.id");
  fs.writeFileSync(f2, c);
}

let f4 = 'src/components/EmpresaConfigGestao.tsx';
if (fs.existsSync(f4)) {
  c = fs.readFileSync(f4, 'utf8');
  c = c.replace(/Number\(e\.target\.value\) \|\| 0/g, "parseFloat(e.target.value) || 0");
  c = c.replace(/value={p\.fase \? p\.duracaoDias \|\| '' : ''}/g, "value={p.fase && p.duracaoDias !== undefined ? p.duracaoDias : ''}");
  fs.writeFileSync(f4, c);
}

let f5 = 'src/components/VisitForm.tsx';
if (fs.existsSync(f5)) {
  c = fs.readFileSync(f5, 'utf8');
  c = c.replace(/formData\.curva_consumo_id === 'v1'/g, "String(formData.curva_consumo_id) === 'v1'");
  c = c.replace(/formData\.curva_consumo_id === 'v2'/g, "String(formData.curva_consumo_id) === 'v2'");
  fs.writeFileSync(f5, c);
}
