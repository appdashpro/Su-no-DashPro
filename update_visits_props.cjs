const fs = require('fs');
let content = fs.readFileSync('src/components/Visits.tsx', 'utf8');

content = content.replace("interface VisitsListProps {", "interface VisitsListProps {\n pendingSyncIds?: string[];");

// And replace the class for the name:
const oldTd = `<td className="px-2 py-2 font-medium text-slate-800">{integrado?.name || 'Desconhecido'}</td>`;
const newTd = `<td className={\`px-2 py-2 font-medium \${pendingSyncIds?.includes(v.id) ? 'text-red-600 font-bold' : 'text-slate-800'}\`} title={pendingSyncIds?.includes(v.id) ? "Aguardando sincronização com a nuvem" : ""}>{integrado?.name || 'Desconhecido'}</td>`;

content = content.replace(oldTd, newTd);

fs.writeFileSync('src/components/Visits.tsx', content);
console.log("Updated Visits.tsx");
