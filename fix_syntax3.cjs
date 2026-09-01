const fs = require('fs');
let code = fs.readFileSync('src/components/VisitForm.tsx', 'utf8');

code = code.replace(/newData\.consumoAcumuladoReal = undefined;\n    \}\n\} \}/g, 'newData.consumoAcumuladoReal = undefined;\n    }\n}\nreturn newData;\n})');

fs.writeFileSync('src/components/VisitForm.tsx', code);
