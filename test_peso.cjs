const fs = require('fs');

let str = fs.readFileSync('src/components/MedicationAnalysis.tsx', 'utf8');

str = str.replace(
  "        let pesoEstimadoKg = t.pesoEstimadoKg || basePesoEstimadoKg;",
  "        let pesoEstimadoKg = (t.pesoEstimadoKg !== undefined && t.pesoEstimadoKg !== null) ? t.pesoEstimadoKg : basePesoEstimadoKg;"
);

fs.writeFileSync('src/components/MedicationAnalysis.tsx', str);
