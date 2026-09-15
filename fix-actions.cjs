const fs = require('fs');

let wf = '.github/workflows/deploy.yml';
if (fs.existsSync(wf)) {
  let c = fs.readFileSync(wf, 'utf8');
  c = c.replace(/path: '\.\/dist'/g, "path: 'dist'");
  fs.writeFileSync(wf, c);
}
