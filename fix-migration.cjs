const fs = require('fs');
let code = fs.readFileSync('src/components/SystemCurvesMigration.tsx', 'utf-8');

code = code.replace(
  "                    metas: sysCurve.metas\n                 });",
  "                    metas: sysCurve.metas,\n                    programa_alimentar: sysCurve.programa_alimentar\n                 });"
);

code = code.replace(
  "                 currentCurvas[existingIndex].metas = sysCurve.metas;",
  "                 currentCurvas[existingIndex].metas = sysCurve.metas;\n                 if (sysCurve.programa_alimentar) {\n                    currentCurvas[existingIndex].programa_alimentar = sysCurve.programa_alimentar;\n                 }"
);

fs.writeFileSync('src/components/SystemCurvesMigration.tsx', code);
