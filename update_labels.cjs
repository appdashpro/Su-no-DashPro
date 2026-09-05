const fs = require('fs');
let code = fs.readFileSync('src/components/MedicationAnalysis.tsx', 'utf8');

code = code.replace(
  "<span className=\"font-bold text-slate-900\">{kg.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg</span>",
  "<span className=\"font-bold text-slate-900\">{viewMode === 'custo' ? 'R$ ' : ''}{kg.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}{viewMode === 'custo' ? '' : ' kg'}</span>"
);

code = code.replace(
  "<span className=\"font-bold text-slate-900\">{data.kg.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg</span>",
  "<span className=\"font-bold text-slate-900\">{viewMode === 'custo' ? 'R$ ' : ''}{data.kg.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}{viewMode === 'custo' ? '' : ' kg'}</span>"
);

code = code.replace(
  "formatter={(value: number) => [`${value.toFixed(1)} kg`, 'Consumo']}",
  "formatter={(value: number) => [`${viewMode === 'custo' ? 'R$ ' : ''}${value.toFixed(1)}${viewMode === 'custo' ? '' : ' kg'}`, viewMode === 'custo' ? 'Custo' : 'Consumo']}"
);

fs.writeFileSync('src/components/MedicationAnalysis.tsx', code);
