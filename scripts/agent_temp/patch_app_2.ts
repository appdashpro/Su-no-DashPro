import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');
content = content.replace(
  /onDelete=\{handleDeleteIntegrado\}\s*\/>/g,
  "onDelete={handleDeleteIntegrado} empresas={empresas} />"
);
fs.writeFileSync('src/App.tsx', content);
