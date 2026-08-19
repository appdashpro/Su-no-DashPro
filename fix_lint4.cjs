const fs = require('fs');
let code = fs.readFileSync('src/components/IntegradoDetailsModal.tsx', 'utf8');

// replace the manual cast
code = code.replace(
  "const expectedPoint = curve.find((p: GrowthCurvePoint) => p.dia >= (visit.idade || 0));",
  "const expectedPoint = curve.find((p: any) => p.dia >= (visit.idade || 0));"
);

fs.writeFileSync('src/components/IntegradoDetailsModal.tsx', code);
