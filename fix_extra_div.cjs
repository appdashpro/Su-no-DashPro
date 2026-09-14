const fs = require('fs');
let code = fs.readFileSync('src/components/EmpresaConfigGestao.tsx', 'utf8');

const lines = code.split('\n');
for (let i = 560; i < 580; i++) {
  if (lines[i].includes('</div>') && lines[i].trim() === '</div>' && lines[i+2].includes('<div className="pt-6 border-t border-slate-100">')) {
    lines.splice(i, 1);
    break;
  }
}
fs.writeFileSync('src/components/EmpresaConfigGestao.tsx', lines.join('\n'));
