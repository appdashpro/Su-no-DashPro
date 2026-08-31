import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');
content = content.replace(
  "<Integrados\n        integrados={visibleIntegrados}\n        visits={visibleVisits}\n        totalVisits={visibleVisits.length}\n        onUpdate={handleUpdateIntegrado}\n        onDelete={handleDeleteIntegrado}",
  "<Integrados\n        integrados={visibleIntegrados}\n        visits={visibleVisits}\n        totalVisits={visibleVisits.length}\n        onUpdate={handleUpdateIntegrado}\n        onDelete={handleDeleteIntegrado}\n        empresas={empresas}"
);
fs.writeFileSync('src/App.tsx', content);
