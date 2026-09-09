const fs = require('fs');
let code = fs.readFileSync('src/lib/priority.ts', 'utf8');

const targetLogic = `  // 2. Mortality
  let mortalityPct = 0;
  if (latestVisit.animaisAlojados && latestVisit.animaisAlojados > 0 && latestVisit.animaisMortos !== undefined && latestVisit.animaisMortos > 0) {
    mortalityPct = (latestVisit.animaisMortos / latestVisit.animaisAlojados) * 100;
  } else if (latestVisit.mortalidade !== undefined) {
    mortalityPct = latestVisit.mortalidade;
  }`;

const replaceLogic = `  // 2. Mortality
  let mortalityPct = 0;
  const totalDescartes = visits.reduce((acc, v) => acc + (v.descartesPeriodo || 0), 0);
  if (latestVisit.animaisAlojados && latestVisit.animaisAlojados > 0 && latestVisit.animaisMortos !== undefined && latestVisit.animaisMortos >= 0) {
    mortalityPct = ((latestVisit.animaisMortos + totalDescartes) / latestVisit.animaisAlojados) * 100;
  } else if (latestVisit.mortalidade !== undefined) {
    mortalityPct = latestVisit.mortalidade;
  }`;

code = code.replace(targetLogic, replaceLogic);
fs.writeFileSync('src/lib/priority.ts', code);
