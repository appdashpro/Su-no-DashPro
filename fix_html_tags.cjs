const fs = require('fs');
let code = fs.readFileSync('src/components/ReferenceCurve.tsx', 'utf8');

code = code.replace(
  /<tbody className="divide-y divide-slate-100 bg-white">\s*<tr>\s*<tr>/,
  `<tbody className="divide-y divide-slate-100 bg-white">\n                  <tr>`
);

fs.writeFileSync('src/components/ReferenceCurve.tsx', code);
