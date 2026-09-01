const fs = require('fs');
let code = fs.readFileSync('src/components/VisitForm.tsx', 'utf8');

const regex = /\}\s*\}\s*\}\s*if \(\(name === 'date'/;
code = code.replace(regex, `}
}
return newData;
});
if ((name === 'date'`);
fs.writeFileSync('src/components/VisitForm.tsx', code);
console.log("Replaced with regex");
