const fs = require('fs');
const code = fs.readFileSync('src/components/EmpresaConfigGestao.tsx', 'utf8');

let depth = 0;
let lines = code.split('\n');
for (let i = 240; i < lines.length; i++) {
  const line = lines[i];
  let m1 = line.match(/<div[^>]*>/g);
  let m2 = line.match(/<\/div>/g);
  let change = (m1 ? m1.length : 0) - (m2 ? m2.length : 0);
  depth += change;
  if (change !== 0) console.log(`${i+1} [${depth}]: ${line.trim()}`);
  if (depth < 0) {
    console.log(`UNBALANCED AT ${i+1}`);
    break;
  }
}
