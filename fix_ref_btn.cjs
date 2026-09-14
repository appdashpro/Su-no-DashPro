const fs = require('fs');
let file = 'src/components/ReferenceCurve.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  "onClick={() => setIsEditing(true)}",
  "onClick={() => setIsEditing(true)} disabled={config?.tipo_calculo_curva === 'GOMPERTZ'}"
);
code = code.replace(
  "className=\"flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors border border-blue-200\"",
  "className={`flex items-center gap-1 px-3 py-1 rounded-md transition-colors border ${config?.tipo_calculo_curva === 'GOMPERTZ' ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50' : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200'}`}"
);

fs.writeFileSync(file, code);
