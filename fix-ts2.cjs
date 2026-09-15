const fs = require('fs');

let c;

// CopagriMigration.tsx
let f1 = 'src/components/CopagriMigration.tsx';
if (fs.existsSync(f1)) {
  c = fs.readFileSync(f1, 'utf8');
  c = c.replace(/find\(c => c.id ===/g, "find((c: any) => c.id ===");
  fs.writeFileSync(f1, c);
}

// CopagriUpdate.tsx
let f2 = 'src/components/CopagriUpdate.tsx';
if (fs.existsSync(f2)) {
  c = fs.readFileSync(f2, 'utf8');
  c = c.replace(/find\(c => c.id ===/g, "find((c: any) => c.id ===");
  fs.writeFileSync(f2, c);
}

// EmpresaConfigGestao.tsx
let f4 = 'src/components/EmpresaConfigGestao.tsx';
if (fs.existsSync(f4)) {
  c = fs.readFileSync(f4, 'utf8');
  c = c.replace(/e\.target\.value === '' \? '' : Number\(e\.target\.value\)/g, "e.target.value === '' ? 0 : Number(e.target.value)");
  c = c.replace(/value={p\.fase \? p\.duracaoDias \|\| '' : ''}/g, "value={p.fase ? p.duracaoDias || 0 : 0}");
  fs.writeFileSync(f4, c);
}

// VisitForm.tsx
let f5 = 'src/components/VisitForm.tsx';
if (fs.existsSync(f5)) {
  c = fs.readFileSync(f5, 'utf8');
  c = c.replace(/Number\(formData\.curva_consumo_id\)/g, "String(formData.curva_consumo_id)");
  c = c.replace(/formData\.curva_consumo_id === 'v1'/g, "String(formData.curva_consumo_id) === 'v1'");
  fs.writeFileSync(f5, c);
}

// data.ts
let f6 = 'src/data.ts';
if (fs.existsSync(f6)) {
  c = fs.readFileSync(f6, 'utf8');
  c = c.replace(/fases\.find\(\(f\)/g, "fases.find((f: any)");
  fs.writeFileSync(f6, c);
}

