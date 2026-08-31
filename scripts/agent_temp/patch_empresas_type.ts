import fs from 'fs';
let content = fs.readFileSync('src/components/Visits.tsx', 'utf-8');
content = content.replace("empresas?: {id: string, nome: string}[];", "empresas?: import('../types').Empresa[];");
fs.writeFileSync('src/components/Visits.tsx', content);
