const fs = require('fs');
let code = fs.readFileSync('src/components/Tutorial.tsx', 'utf-8');

code = code.replace(
  "const { status } = data;",
  ""
);

fs.writeFileSync('src/components/Tutorial.tsx', code);
console.log('patched Tutorial status');
