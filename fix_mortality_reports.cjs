const fs = require('fs');

const fixFile = (path) => {
  let code = fs.readFileSync(path, 'utf8');
  code = code.replace(
    /const propMetaMortalidade = (targetAge|lastIdade) \? Number\(\(\(Math\.min\(\1, 105\) \/ 105\) \* finalMetaMortalidade\)\.toFixed\(2\)\) : finalMetaMortalidade;/g,
    (match, p1) => `const propMetaMortalidade = ${p1} > 0 ? Number(((Math.min(${p1}, 105) / 105) * finalMetaMortalidade).toFixed(2)) : (${p1} < 0 ? 0 : finalMetaMortalidade);`
  );
  fs.writeFileSync(path, code);
};

fixFile('src/reports/templates/ConsolidatedLotesReport.ts');
fixFile('src/reports/templates/ConsolidatedVisitsReport.ts');
