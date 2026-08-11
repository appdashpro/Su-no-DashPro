const fs = require('fs');
let code = fs.readFileSync('src/components/Visits.tsx', 'utf-8');
code = code.replace(
  `onClick={onNewVisit} className="flex-1 sm:flex-none`,
  `id="btn-novo-lancamento" onClick={onNewVisit} className="flex-1 sm:flex-none`
);
fs.writeFileSync('src/components/Visits.tsx', code);
console.log('patched visits btn');
