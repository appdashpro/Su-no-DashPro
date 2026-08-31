const fs = require('fs');
let content = fs.readFileSync('src/components/VisitForm.tsx', 'utf8');

const anchor1 = 'const currentIdade = Number(formData.idade) || 0;';
const replacement1 = `const currentIdade = Number(formData.idade) || 0;\n  const finalMetaMortalidade = currentConfig?.meta_mortalidade !== undefined && currentConfig?.meta_mortalidade !== null ? currentConfig.meta_mortalidade : 3;\n  const propMetaMortalidade = currentIdade ? Number(((Math.min(currentIdade, 105) / 105) * finalMetaMortalidade).toFixed(2)) : finalMetaMortalidade;\n  const isOverMetaMortalidade = Number(formData.mortalidade || 0) > propMetaMortalidade;`;

content = content.replace(anchor1, replacement1);

const anchor2 = `<span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded text-[10px]">{Number(formData.mortalidade || 0).toFixed(2)}%</span>`;
const replacement2 = `<span className={\`font-bold px-2 py-0.5 rounded text-[10px] \${isOverMetaMortalidade ? 'text-red-600 bg-red-50' : 'text-slate-600 bg-slate-100'}\`} title={\`Meta proporcional: \${propMetaMortalidade.toFixed(2)}%\`}>{Number(formData.mortalidade || 0).toFixed(2)}%</span>`;

if (content.includes(anchor2)) {
  content = content.replace(anchor2, replacement2);
  fs.writeFileSync('src/components/VisitForm.tsx', content);
  console.log("Success replacing in VisitForm.tsx");
} else {
  console.log("Failed to find anchor2 in VisitForm.tsx");
}
