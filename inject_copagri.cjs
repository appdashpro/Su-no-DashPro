const fs = require('fs');
const copagri = fs.readFileSync('copagri_out.ts', 'utf8');
let data = fs.readFileSync('src/data.ts', 'utf8');

data = data.replace(
  /export const growthCurvesMisto: CurveVersion\[\] = \[/,
  `export const growthCurvesMisto: CurveVersion[] = [\n${copagri}`
);

fs.writeFileSync('src/data.ts', data);
