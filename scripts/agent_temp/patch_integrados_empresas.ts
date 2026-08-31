import fs from 'fs';
let content = fs.readFileSync('src/components/Integrados.tsx', 'utf-8');

// add empresas to props interface
content = content.replace(
  "  onDelete: (id: string) => void;\n}",
  "  onDelete: (id: string) => void;\n  empresas?: import('../types').Empresa[];\n}"
);

// add to destructuring
content = content.replace(
  "export function Integrados({ integrados, visits, totalVisits, onUpdate, onDelete }: IntegradosProps) {",
  "export function Integrados({ integrados, visits, totalVisits, onUpdate, onDelete, empresas = [] }: IntegradosProps) {"
);

fs.writeFileSync('src/components/Integrados.tsx', content);
