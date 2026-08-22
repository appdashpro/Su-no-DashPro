const fs = require('fs');
let content = fs.readFileSync('./src/components/ReferenceCurve.tsx', 'utf8');

const regexToRemove = /\{\/\*\s*Versões de Curvas\s*\*\/\}[\s\S]*?(?=\{\s*loading\s*\?)/;
content = content.replace(regexToRemove, '');

fs.writeFileSync('./src/components/ReferenceCurve.tsx', content);
