const fs = require('fs');
let code = fs.readFileSync('src/components/TratamentosFormSection.tsx', 'utf8');

code = code.replace(
`  const displayWeightValue = localWeightStr !== ''
    ? localWeightStr
    : ((pesoAmostradoKg !== undefined && Number(pesoAmostradoKg) > 0)
        ? String(pesoAmostradoKg)
        : (savedTreatmentWeight
            ? String(savedTreatmentWeight)
            : (pesoEstimadoCurve > 0 ? pesoEstimadoCurve.toFixed(2) : '')));`,
`  const displayWeightValue = localWeightStr !== null
    ? localWeightStr
    : ((pesoAmostradoKg !== undefined && Number(pesoAmostradoKg) > 0)
        ? String(pesoAmostradoKg)
        : (savedTreatmentWeight
            ? String(savedTreatmentWeight)
            : (pesoEstimadoCurve > 0 ? pesoEstimadoCurve.toFixed(2) : '')));`
);
fs.writeFileSync('src/components/TratamentosFormSection.tsx', code);
