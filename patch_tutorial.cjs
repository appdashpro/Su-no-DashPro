const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  "import { ErrorBoundary } from './components/ErrorBoundary';",
  "import { ErrorBoundary } from './components/ErrorBoundary';\nimport { Tutorial } from './components/Tutorial';"
);

fs.writeFileSync('src/App.tsx', code);
console.log('patched Tutorial import');
