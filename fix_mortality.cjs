const fs = require('fs');
let code = fs.readFileSync('src/components/VisitForm.tsx', 'utf8');

code = code.replace(
  /const propMetaMortalidade = currentIdade \? Number\(\(\(Math\.min\(currentIdade, 105\) \/ 105\) \* finalMetaMortalidade\)\.toFixed\(2\)\) : finalMetaMortalidade;/,
  `const propMetaMortalidade = currentIdade > 0 ? Number(((Math.min(currentIdade, 105) / 105) * finalMetaMortalidade).toFixed(2)) : (currentIdade < 0 ? 0 : finalMetaMortalidade);`
);

fs.writeFileSync('src/components/VisitForm.tsx', code);
