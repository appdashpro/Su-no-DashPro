import fs from 'fs';
let code = fs.readFileSync('src/components/MedicationAnalysis.tsx', 'utf8');
code = code.replace(
  "formatter={(value: any, name: string) => [\\`\\${Number(value || 0).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg\\`, name]}",
  "formatter={(value: any, name: any) => [\\`\\${Number(value || 0).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg\\`, String(name || '')]}"
);
fs.writeFileSync('src/components/MedicationAnalysis.tsx', code);
