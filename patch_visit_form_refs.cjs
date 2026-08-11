const fs = require('fs');
let code = fs.readFileSync('src/components/VisitForm.tsx', 'utf-8');

if (!code.includes("import { tutorialRefs }")) {
  code = code.replace(
    "import React",
    "import { tutorialRefs } from '../lib/tutorialRefs';\nimport React"
  );
}

code = code.replace(
  'id="form-integrado-nome"',
  'id="form-integrado-nome" ref={(el) => tutorialRefs.formIntegradoNome.current = el}'
);

code = code.replace(
  'id="form-salvar"',
  'id="form-salvar" ref={(el) => tutorialRefs.formSalvar.current = el}'
);

fs.writeFileSync('src/components/VisitForm.tsx', code);
console.log('patched VisitForm refs');
