const fs = require('fs');
let c;

let f4 = 'src/components/EmpresaConfigGestao.tsx';
if (fs.existsSync(f4)) {
  c = fs.readFileSync(f4, 'utf8');
  c = c.replace(/pm: Number\(e\.target\.value\) === '' \? '' : parseFloat\(e\.target\.value\)/g, "pm: parseFloat(e.target.value) || 0");
  c = c.replace(/b: Number\(e\.target\.value\) === '' \? '' : parseFloat\(e\.target\.value\)/g, "b: parseFloat(e.target.value) || 0");
  c = c.replace(/em: Number\(e\.target\.value\) === '' \? '' : parseFloat\(e\.target\.value\)/g, "em: parseFloat(e.target.value) || 0");
  c = c.replace(/pi: Number\(e\.target\.value\) === '' \? '' : parseFloat\(e\.target\.value\)/g, "pi: parseFloat(e.target.value) || 0");
  fs.writeFileSync(f4, c);
}

