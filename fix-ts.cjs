const fs = require('fs');

// Fix CopagriMigration.tsx
let f1 = 'src/components/CopagriMigration.tsx';
if (fs.existsSync(f1)) {
  let c = fs.readFileSync(f1, 'utf8');
  c = c.replace(/c => c\.id ===/g, "(c: any) => c.id ===");
  fs.writeFileSync(f1, c);
}

// Fix CopagriUpdate.tsx
let f2 = 'src/components/CopagriUpdate.tsx';
if (fs.existsSync(f2)) {
  let c = fs.readFileSync(f2, 'utf8');
  c = c.replace(/c => c\.id ===/g, "(c: any) => c.id ===");
  fs.writeFileSync(f2, c);
}

// Fix SystemCurvesMigration.tsx
let f3 = 'src/components/SystemCurvesMigration.tsx';
if (fs.existsSync(f3)) {
  let c = fs.readFileSync(f3, 'utf8');
  c = c.replace(/c => \{/g, "(c: any) => {");
  c = c.replace(/c => c\.id/g, "(c: any) => c.id");
  fs.writeFileSync(f3, c);
}

// Fix EmpresaConfigGestao.tsx
let f4 = 'src/components/EmpresaConfigGestao.tsx';
if (fs.existsSync(f4)) {
  let c = fs.readFileSync(f4, 'utf8');
  c = c.replace(/pm: e\.target\.value/g, "pm: Number(e.target.value)");
  c = c.replace(/b: e\.target\.value/g, "b: Number(e.target.value)");
  c = c.replace(/em: e\.target\.value/g, "em: Number(e.target.value)");
  c = c.replace(/pi: e\.target\.value/g, "pi: Number(e.target.value)");
  c = c.replace(/Number\(Number\(e\.target\.value\)\)/g, "Number(e.target.value)"); // Just in case
  c = c.replace(/value={p\.fase \? p\.duracaoDias : ''}/g, "value={p.fase ? p.duracaoDias || '' : ''}");
  fs.writeFileSync(f4, c);
}

// Fix VisitForm.tsx
let f5 = 'src/components/VisitForm.tsx';
if (fs.existsSync(f5)) {
  let c = fs.readFileSync(f5, 'utf8');
  c = c.replace(/formData\.curva_consumo_id === 'v1'/g, "String(formData.curva_consumo_id) === 'v1'");
  fs.writeFileSync(f5, c);
}

// Fix data.ts
let f6 = 'src/data.ts';
if (fs.existsSync(f6)) {
  let c = fs.readFileSync(f6, 'utf8');
  c = c.replace(/const getMetaForPhase = \(faseName\) => \{/g, "const getMetaForPhase = (faseName: string) => {");
  c = c.replace(/const prog = fases\.find\(\(f\) =>/g, "const prog = fases.find((f: any) =>");
  fs.writeFileSync(f6, c);
}

