const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

code = code.replace(
  `onClick={() => setActiveKpiModal('total')}`,
  `id="kpi-total" onClick={() => setActiveKpiModal('total')}`
);
code = code.replace(
  `onClick={() => stats.alertCount > 0 && setActiveKpiModal('alertas')}`,
  `id="kpi-alertas" onClick={() => stats.alertCount > 0 && setActiveKpiModal('alertas')}`
);
code = code.replace(
  `onClick={() => setActiveKpiModal('mortalidade')}`,
  `id="kpi-mortalidade" onClick={() => setActiveKpiModal('mortalidade')}`
);
code = code.replace(
  `onClick={() => setActiveKpiModal('desvio')}`,
  `id="kpi-desvio" onClick={() => setActiveKpiModal('desvio')}`
);

fs.writeFileSync('src/components/Dashboard.tsx', code);
console.log('patched dashboard kpi ids');
