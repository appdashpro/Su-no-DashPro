const fs = require('fs');
let code = fs.readFileSync('src/components/MedicationAnalysis.tsx', 'utf8');

code = code.replace(
  `          // Reverse-engineer the effective weight used during calculation
          if (animaisTratados > 0 && doseMgKg > 0 && duracaoDias > 0) {
            pesoEstimadoKg = mgTotalTratamento / (animaisTratados * doseMgKg * duracaoDias);
          }`,
  ``
);

fs.writeFileSync('src/components/MedicationAnalysis.tsx', code);
