const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

content = content.replace(
  /const mortos = d\.animaisMortos !== undefined && d\.animaisMortos !== null \? Number\(d\.animaisMortos\) : Number\(d\.mortalidade \|\| 0\);/g,
  `const mortos = d.animaisMortos !== undefined && d.animaisMortos !== null ? Number(d.animaisMortos) : (d.mortalidade !== undefined && Number(d.animaisAlojados || 0) > 0 ? (Number(d.mortalidade) / 100) * Number(d.animaisAlojados || 0) : 0);`
);

fs.writeFileSync('src/components/Dashboard.tsx', content);
console.log('Fixed dashboard mortos calculation');
