const fs = require('fs');
let code = fs.readFileSync('src/components/VisitForm.tsx', 'utf8');

const targetStr = `return newData;
});
if ((name === 'date'`;

code = code.replace(targetStr, `if ((name === 'date'`);

fs.writeFileSync('src/components/VisitForm.tsx', code);
console.log("Fixed!");
