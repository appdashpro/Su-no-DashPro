const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');
code = code.replace("const mortPct = calculateMortalityRate(v);", "const mortPct = calculateMortalityRate(v, visits);");
fs.writeFileSync('src/components/Dashboard.tsx', code);
