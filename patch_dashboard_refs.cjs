const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

if (!code.includes("import { tutorialRefs }")) {
  code = code.replace(
    "import React",
    "import { tutorialRefs } from '../lib/tutorialRefs';\nimport React"
  );
}

code = code.replace(
  'id="kpi-alertas"',
  'id="kpi-alertas" ref={(el) => tutorialRefs.kpiAlertas.current = el}'
);

fs.writeFileSync('src/components/Dashboard.tsx', code);
console.log('patched Dashboard refs');
