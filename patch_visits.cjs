const fs = require('fs');
let content = fs.readFileSync('src/components/Visits.tsx', 'utf8');

const anchor1 = 'const metas = activeCurveInfo?.metas || {};';
const replacement1 = `const metas = activeCurveInfo?.metas || {};\n const finalMeta = currentConfig?.meta_mortalidade !== undefined && currentConfig?.meta_mortalidade !== null ? currentConfig.meta_mortalidade : 3;\n const propMeta = v.idade ? Number(((Math.min(v.idade, 105) / 105) * finalMeta).toFixed(2)) : finalMeta;\n const mVal = v.mortalidade !== undefined && v.mortalidade !== null ? Number(v.mortalidade) : (v.animaisAlojados && v.animaisMortos ? (Number(v.animaisMortos) / Number(v.animaisAlojados)) * 100 : null);\n const isOverMeta = mVal !== null && mVal > propMeta;`;

content = content.replace(anchor1, replacement1);

const anchor2 = `{v.mortalidade !== undefined && v.mortalidade !== null \n ? <span className="text-xs font-medium text-red-600 bg-red-50 px-1.5 py-0.5 rounded">{Number(v.mortalidade || 0).toFixed(2)}%</span> \n : v.animaisAlojados && v.animaisMortos ? <span className="text-xs font-medium text-red-600 bg-red-50 px-1.5 py-0.5 rounded">{((Number(v.animaisMortos)/Number(v.animaisAlojados))*100).toFixed(2)}%</span> : '-'}`;

const replacement2 = `{mVal !== null ? (
   <span className={\`text-xs font-medium px-1.5 py-0.5 rounded \${isOverMeta ? 'text-red-600 bg-red-50' : 'text-slate-600 bg-slate-50'}\`} title={\`Meta para esta idade: \${propMeta.toFixed(2)}%\`}>
     {mVal.toFixed(2)}%
   </span>
 ) : '-'}`;

if (content.includes(anchor2)) {
  content = content.replace(anchor2, replacement2);
  fs.writeFileSync('src/components/Visits.tsx', content);
  console.log("Success replacing in Visits.tsx");
} else {
  console.log("Failed to find anchor2 in Visits.tsx");
}
