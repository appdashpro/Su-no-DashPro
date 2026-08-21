const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  `onSetViewingIntegradoId={setViewingIntegradoId}`,
  `onSetViewingIntegradoId={setViewingIntegradoId} empresas={visibleEmpresas} pendingSyncIds={pendingSyncIds}`
);

fs.writeFileSync('src/App.tsx', code, 'utf8');
