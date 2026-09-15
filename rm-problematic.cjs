const fs = require('fs');

try {
  fs.unlinkSync('src/components/CopagriMigration.tsx');
} catch(e) {}
try {
  fs.unlinkSync('src/components/CopagriUpdate.tsx');
} catch(e) {}

let f4 = 'src/components/EmpresaConfigGestao.tsx';
if (fs.existsSync(f4)) {
  let c = fs.readFileSync(f4, 'utf8');
  c = c.replace(/pm: e.target.value === '' \? 0 : parseFloat\(e.target.value\)/g, "pm: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0");
  c = c.replace(/b: e.target.value === '' \? 0 : parseFloat\(e.target.value\)/g, "b: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0");
  c = c.replace(/em: e.target.value === '' \? 0 : parseFloat\(e.target.value\)/g, "em: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0");
  c = c.replace(/pi: e.target.value === '' \? 0 : parseFloat\(e.target.value\)/g, "pi: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0");
  fs.writeFileSync(f4, c);
}

