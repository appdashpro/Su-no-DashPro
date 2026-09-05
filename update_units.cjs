const fs = require('fs');
let code = fs.readFileSync('src/components/MedicationAnalysis.tsx', 'utf8');

code = code.replace(
  "{totalKg.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} <span className=\"text-base font-medium text-slate-500\">kg</span>",
  "{viewMode === 'custo' ? 'R$ ' : ''}{totalKg.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} <span className=\"text-base font-medium text-slate-500\">{viewMode === 'custo' ? '' : 'kg'}</span>"
);

code = code.replace(
  "{sortedProducts[0] ? sortedProducts[0][1].toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' kg' : '-'}",
  "{sortedProducts[0] ? (viewMode === 'custo' ? 'R$ ' : '') + sortedProducts[0][1].toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + (viewMode === 'custo' ? '' : ' kg') : '-'}"
);

code = code.replace(
  "{sortedMotivos[0] ? sortedMotivos[0][1].toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' kg' : '-'}",
  "{sortedMotivos[0] ? (viewMode === 'custo' ? 'R$ ' : '') + sortedMotivos[0][1].toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + (viewMode === 'custo' ? '' : ' kg') : '-'}"
);

fs.writeFileSync('src/components/MedicationAnalysis.tsx', code);
