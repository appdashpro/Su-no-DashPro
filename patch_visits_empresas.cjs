const fs = require('fs');
let appCode = fs.readFileSync('src/App.tsx', 'utf8');

appCode = appCode.replace(
  `pendingSyncIds={pendingSyncIds}`,
  `pendingSyncIds={pendingSyncIds}\n              empresas={visibleEmpresas}`
);

fs.writeFileSync('src/App.tsx', appCode, 'utf8');

let visitsCode = fs.readFileSync('src/components/Visits.tsx', 'utf8');
visitsCode = visitsCode.replace(
  `onSetViewingIntegradoId?: (id: string | null) => void;`,
  `onSetViewingIntegradoId?: (id: string | null) => void;\n  empresas?: {id: string, nome: string}[];`
);
visitsCode = visitsCode.replace(
  `pendingSyncIds }: VisitsListProps) {`,
  `pendingSyncIds, empresas = [] }: VisitsListProps) {`
);
visitsCode = visitsCode.replace(
  `{integrado?.empresaName || '-'}`,
  `{integrado?.empresaName || empresas.find(e => e.id === integrado?.empresaId)?.nome || '-'}`
);

fs.writeFileSync('src/components/Visits.tsx', visitsCode, 'utf8');
