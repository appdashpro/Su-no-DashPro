const fs = require('fs');
let code = fs.readFileSync('src/components/Tutorial.tsx', 'utf-8');

code = code.replace(
  "if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {",
  "if (type === EVENTS.STEP_AFTER) {"
);

fs.writeFileSync('src/components/Tutorial.tsx', code);
console.log('patched Tutorial target not found');
