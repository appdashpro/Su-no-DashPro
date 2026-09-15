const fs = require('fs');
let c;

let app = 'src/App.tsx';
if (fs.existsSync(app)) {
  c = fs.readFileSync(app, 'utf8');
  c = c.replace(/import \{ CopagriMigration \} from '\.\/components\/CopagriMigration';\n/g, "");
  c = c.replace(/<CopagriMigration \/>\n/g, "");
  fs.writeFileSync(app, c);
}

let f4 = 'src/components/EmpresaConfigGestao.tsx';
if (fs.existsSync(f4)) {
  c = fs.readFileSync(f4, 'utf8');
  c = c.replace(/em: e\.target\.value === '' \? 0 : parseFloat\(e\.target\.value\)/g, "em: parseFloat(e.target.value) || 0");
  c = c.replace(/onChange=\{\(e\) => setMetaMortalidade\(e\.target\.value === '' \? '' : parseFloat\(e\.target\.value\)\)\}/g, "onChange={(e) => setMetaMortalidade(parseFloat(e.target.value) || 0)}");
  fs.writeFileSync(f4, c);
}

let f5 = 'src/components/VisitForm.tsx';
if (fs.existsSync(f5)) {
  c = fs.readFileSync(f5, 'utf8');
  c = c.replace(/String\(formData\.curva_consumo_id\) === 'v1'/g, "formData.curva_consumo_id === 'v1'");
  c = c.replace(/String\(formData\.curva_consumo_id\) === 'v2'/g, "formData.curva_consumo_id === 'v2'");
  c = c.replace(/Number\(formData\.curva_consumo_id\)/g, "String(formData.curva_consumo_id)");
  fs.writeFileSync(f5, c);
}

