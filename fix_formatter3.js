import fs from 'fs';
let code = fs.readFileSync('src/components/MedicationAnalysis.tsx', 'utf8');
code = code.replace(
  "formatter={(value: any, name: string)",
  "formatter={(value: any, name: any)"
);
fs.writeFileSync('src/components/MedicationAnalysis.tsx', code);
