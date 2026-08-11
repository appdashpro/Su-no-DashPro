const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

if (!code.includes("import { tutorialRefs }")) {
  code = code.replace(
    "import React",
    "import { tutorialRefs } from './lib/tutorialRefs';\nimport React"
  );
}

code = code.replace(
  'id="header-title"',
  'id="header-title" ref={(el) => tutorialRefs.headerTitle.current = el}'
);

fs.writeFileSync('src/App.tsx', code);
console.log('patched App refs');
