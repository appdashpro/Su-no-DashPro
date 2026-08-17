const fs = require('fs');
let content = fs.readFileSync('src/components/VisitForm.tsx', 'utf8');

// Fix 1: Vivos calculation
content = content.replace(
  /const mortos = Number\(newData\.animaisMortos\) \|\| 0;\n\s*const vivos = alojados - mortos;/,
  'const mortos = Number(newData.animaisMortos) || 0;\n    const descartes = Number(newData.descartesPeriodo) || 0;\n    const vivos = alojados - mortos - descartes;'
);

// Fix 2: Display vivos
content = content.replace(
  /\{\(Number\(formData\.animaisAlojados\) \|\| 0\) - \(Number\(formData\.animaisMortos\) \|\| 0\)\} vivos/g,
  '{(Number(formData.animaisAlojados) || 0) - (Number(formData.animaisMortos) || 0) - (Number(formData.descartesPeriodo) || 0)} vivos'
);

// Fix 3: tratamentos animaisVivos
content = content.replace(
  /animaisVivos=\{\(Number\(formData\.animaisAlojados\) \|\| 0\) - \(Number\(formData\.animaisMortos\) \|\| 0\)\}/g,
  'animaisVivos={(Number(formData.animaisAlojados) || 0) - (Number(formData.animaisMortos) || 0) - (Number(formData.descartesPeriodo) || 0)}'
);

fs.writeFileSync('src/components/VisitForm.tsx', content);
console.log('Fixed vivos calculation in VisitForm');
