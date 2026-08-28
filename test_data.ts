import fs from 'fs';
const code = fs.readFileSync('src/data.ts', 'utf8');
console.log(code.includes('export const getActiveCurve'));
