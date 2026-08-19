const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetLogic = `{getRoleBadge()}`;
const replacementLogic = ``;

content = content.replace(targetLogic, replacementLogic);
fs.writeFileSync('src/App.tsx', content, 'utf8');
