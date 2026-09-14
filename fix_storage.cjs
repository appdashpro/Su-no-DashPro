const fs = require('fs');

const file = 'src/lib/storage.ts';
let code = fs.readFileSync(file, 'utf8');

const regex = /\/\/\ Inject default curves to any config that is missing them[\s\S]*?parsed\.forEach\(\(c: any\) => \{[\s\S]*?\}\);\s*\/\/\ Ensure Mugnol config/g;

code = code.replace(regex, '// Ensure Mugnol config');

fs.writeFileSync(file, code);
