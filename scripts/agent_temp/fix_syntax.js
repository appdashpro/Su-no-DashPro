import fs from 'fs';
let code = fs.readFileSync('src/components/MedicationAnalysis.tsx', 'utf8');
code = code.replace(
  "style={{ width: \\`\\${Math.min(100, (kg / totalKg) * 100)}%\\` }}",
  "style={{ width: `${Math.min(100, (kg / totalKg) * 100)}%` }}"
);
fs.writeFileSync('src/components/MedicationAnalysis.tsx', code);
