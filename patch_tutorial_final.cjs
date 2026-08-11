const fs = require('fs');
let code = fs.readFileSync('src/components/Tutorial.tsx', 'utf-8');

if (!code.includes("import { tutorialRefs }")) {
  code = code.replace(
    "import React",
    "import { tutorialRefs } from '../lib/tutorialRefs';\nimport React"
  );
}

// Ensure the helper is there
if (!code.includes("const getTarget = ")) {
  code = code.replace(
    "const steps: Step[] = [",
    `const getTarget = (selector: string, refItem: { current: HTMLElement | null }) => {
    return refItem.current || selector;
  };

  const steps: Step[] = [`
  );
}

code = code.replace(
  "target: '#header-title',",
  "target: getTarget('#header-title', tutorialRefs.headerTitle),"
);

code = code.replace(
  "target: '#kpi-alertas',",
  "target: getTarget('#kpi-alertas', tutorialRefs.kpiAlertas),"
);

code = code.replace(
  "target: '#btn-novo-lancamento',",
  "target: getTarget('#btn-novo-lancamento', tutorialRefs.btnNovoLancamento),"
);

code = code.replace(
  "target: '#form-integrado-nome',",
  "target: getTarget('#form-integrado-nome', tutorialRefs.formIntegradoNome),"
);

code = code.replace(
  "target: '#form-salvar',",
  "target: getTarget('#form-salvar', tutorialRefs.formSalvar),"
);

fs.writeFileSync('src/components/Tutorial.tsx', code);
console.log('patched Tutorial refs');
