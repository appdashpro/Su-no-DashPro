const fs = require('fs');
let code = fs.readFileSync('src/components/VisitForm.tsx', 'utf8');

code = code.replace(
  /value=\{formData\.idade \|\| ''\}/g,
  `value={formData.idade !== undefined && formData.idade !== null && formData.idade !== '' ? formData.idade : ''}`
);

fs.writeFileSync('src/components/VisitForm.tsx', code);
