const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

content = content.replace(
  'const sorted = [...chartConfig.curva_desempenho].sort((a: any, b: any) => a.dataVigencia.localeCompare(b.dataVigencia));',
  'const sorted = [...chartConfig.curva_desempenho].sort((a: any, b: any) => (a.dataVigencia || "").localeCompare(b.dataVigencia || ""));'
);

content = content.replace(
  'return b.name.localeCompare(a.name);',
  'return (b.name || "").localeCompare(a.name || "");'
);

content = content.replace(
  'return a.name.localeCompare(b.name);',
  'return (a.name || "").localeCompare(b.name || "");'
);

fs.writeFileSync('src/components/Dashboard.tsx', content);
console.log("Patched successfully");
