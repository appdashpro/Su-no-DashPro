const fs = require('fs');
let code = fs.readFileSync('src/components/Tutorial.tsx', 'utf-8');

code = code.replace(
  /styles=\{\{[\s\S]*?options: \{[\s\S]*?\},[\s\S]*?spotlight: \{\}[\s\S]*?\}\}/m,
  "styles={{ spotlight: {} }}"
);

fs.writeFileSync('src/components/Tutorial.tsx', code);
console.log('Fixed styles');
