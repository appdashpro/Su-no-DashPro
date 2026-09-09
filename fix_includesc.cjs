const fs = require('fs');
let code = fs.readFileSync('src/components/VisitForm.tsx', 'utf8');

code = code.replace(/predefined\.includesc/g, 'predefined.includes(c)');

fs.writeFileSync('src/components/VisitForm.tsx', code);
