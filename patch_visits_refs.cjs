const fs = require('fs');
let code = fs.readFileSync('src/components/Visits.tsx', 'utf-8');

if (!code.includes("import { tutorialRefs }")) {
  code = code.replace(
    "import React",
    "import { tutorialRefs } from '../lib/tutorialRefs';\nimport React"
  );
}

code = code.replace(
  'id="btn-novo-lancamento"',
  'id="btn-novo-lancamento" ref={(el) => tutorialRefs.btnNovoLancamento.current = el}'
);

fs.writeFileSync('src/components/Visits.tsx', code);
console.log('patched Visits refs');
