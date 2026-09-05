const fs = require('fs');
let code = fs.readFileSync('src/components/MedicationAnalysis.tsx', 'utf8');

code = code.replace(
  /className="text-2xl font-bold text-slate-800">\{totalKg\.toFixed\(2\)\} kg<\/p>/g,
  "className=\"text-2xl font-bold text-slate-800\">{viewMode === 'custo' ? 'R$ ' : ''}{totalKg.toFixed(2)}{viewMode === 'volume' ? ' kg' : ''}</p>"
);

code = code.replace(
  /\{kg\.toFixed\(2\)\} kg/g,
  "{viewMode === 'custo' ? 'R$ ' + kg.toFixed(2) : kg.toFixed(2) + ' kg'}"
);

code = code.replace(
  /<div>\{data\.kg\.toFixed\(2\)\} kg<\/div>/g,
  "<div>{viewMode === 'custo' ? 'R$ ' + data.kg.toFixed(2) : data.kg.toFixed(2) + ' kg'}</div>"
);

code = code.replace(
  /<div>\{kgPer1000\.toFixed\(2\)\} kg \/ 1000 cab<\/div>/g,
  "<div>{viewMode === 'custo' ? 'R$ ' : ''}{kgPer1000.toFixed(2)}{viewMode === 'volume' ? ' kg' : ''} / 1000 cab</div>"
);

fs.writeFileSync('src/components/MedicationAnalysis.tsx', code);
