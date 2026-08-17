import fs from 'fs';
let code = fs.readFileSync('src/components/MedicationAnalysis.tsx', 'utf8');
code = code.replace(
  "formatter={(value: number) => [\\`\\${value.toLocaleString('pt-BR')} kg\\`, 'Consumo']}",
  "formatter={(value: any) => [\\`\\${Number(value).toLocaleString('pt-BR')} kg\\`, 'Consumo']}"
);
fs.writeFileSync('src/components/MedicationAnalysis.tsx', code);
