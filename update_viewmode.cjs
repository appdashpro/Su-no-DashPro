const fs = require('fs');
let code = fs.readFileSync('src/components/MedicationAnalysis.tsx', 'utf8');

code = code.replace(
  '<div className="flex items-center gap-2">',
  `<div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
            <button
              onClick={() => setViewMode('kg')}
              className={\`px-3 py-1 text-xs font-medium rounded-md transition-colors \${viewMode === 'kg' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}\`}
            >
              Volume (Kg)
            </button>
            <button
              onClick={() => setViewMode('custo')}
              className={\`px-3 py-1 text-xs font-medium rounded-md transition-colors \${viewMode === 'custo' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}\`}
            >
              Custo (R$)
            </button>
          </div>`
);

fs.writeFileSync('src/components/MedicationAnalysis.tsx', code);
