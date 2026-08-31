import fs from 'fs';
let content = fs.readFileSync('src/components/Integrados.tsx', 'utf-8');
content = content.replace(
  "userProfile?.empresas?.find((e: any) => e.id === lote.empresaId)",
  "empresas.find(e => e.id === lote.empresaId)"
);
fs.writeFileSync('src/components/Integrados.tsx', content);
