const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const targetStr = `  return sortedData.map((row) => {
    const mVal = row.animaisMortos !== undefined ? (Number(row.animaisMortos) / Number(row.animaisAlojados)) * 100 : Number(row.mortalidade || 0);
    return (
      <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
        <td 
          className={\`px-4 py-3 font-medium whitespace-nowrap \${onNavigateToVisit ? 'text-blue-600 hover:text-blue-800 cursor-pointer underline' : 'text-slate-800'}\`}
          onClick={() => {
            setActiveKpiModal(null);
            if (onNavigateToVisit) onNavigateToVisit(row.id);
          }}
        >
          {row.name}
        </td>
        <td className="px-4 py-3 text-slate-600 text-center">{row.idade} d</td>
        <td className="px-4 py-3 text-right font-medium">
          {activeKpiModal === 'mortalidade' ? (
            <span className={\`\${mVal > (configs.find((c: any) => c.empresa_id === integrados.find(i => i.id === row.integradoId)?.empresaId)?.meta_mortalidade ?? 3) ? 'text-red-600' : 'text-slate-700'}\`}>
              {mVal.toFixed(2)}%
            </span>
          ) : (`;

const newStr = `  return sortedData.map((row) => {
    const mVal = row.animaisMortos !== undefined ? (Number(row.animaisMortos) / Number(row.animaisAlojados)) * 100 : Number(row.mortalidade || 0);
    const configRow = configs.find((c: any) => c.empresa_id === integrados.find(i => i.id === row.integradoId)?.empresaId);
    const finalMeta = configRow?.meta_mortalidade !== undefined && configRow?.meta_mortalidade !== null ? configRow.meta_mortalidade : 3;
    const propMeta = row.idade ? Number(((Math.min(row.idade, 105) / 105) * finalMeta).toFixed(2)) : finalMeta;
    return (
      <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
        <td 
          className={\`px-4 py-3 font-medium whitespace-nowrap \${onNavigateToVisit ? 'text-blue-600 hover:text-blue-800 cursor-pointer underline' : 'text-slate-800'}\`}
          onClick={() => {
            setActiveKpiModal(null);
            if (onNavigateToVisit) onNavigateToVisit(row.id);
          }}
        >
          {row.name}
        </td>
        <td className="px-4 py-3 text-slate-600 text-center">{row.idade} d</td>
        <td className="px-4 py-3 text-right font-medium">
          {activeKpiModal === 'mortalidade' ? (
            <div className="flex flex-col items-end">
               <span className={\`\${mVal > propMeta ? 'text-red-600' : 'text-slate-700'}\`}>
                 {mVal.toFixed(2)}%
               </span>
               <span className="text-[9px] text-slate-400">Meta: {propMeta.toFixed(2)}%</span>
            </div>
          ) : (`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, newStr);
  fs.writeFileSync('src/components/Dashboard.tsx', content);
  console.log("Success");
} else {
  console.log("Not found, falling back to regex");
  
  // Regex approach for just the span block
  const spanTarget = `<span className={\`\${mVal > (configs.find((c: any) => c.empresa_id === integrados.find(i => i.id === row.integradoId)?.empresaId)?.meta_mortalidade ?? 3) ? 'text-red-600' : 'text-slate-700'}\`}>\n              {mVal.toFixed(2)}%\n            </span>`;
  
  if (content.includes(spanTarget)) {
    console.log("Span found");
  } else {
    console.log("Span not found either");
  }
}
