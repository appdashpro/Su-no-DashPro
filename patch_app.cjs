const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "import { Prioridades } from './components/Prioridades';",
  "import { Prioridades } from './components/Prioridades';\nimport { FaturamentoGestao } from './components/FaturamentoGestao';"
);

const faturamentoJSX = `
 <div style={{ display: currentTab === 'faturamento' ? 'block' : 'none' }}>
   <FaturamentoGestao visits={visibleVisits} integrados={visibleIntegrados} />
 </div>
`;

code = code.replace(
  "const renderContent = () => {   return ( <>",
  "const renderContent = () => {   return ( <>" + faturamentoJSX
);

fs.writeFileSync('src/App.tsx', code);
