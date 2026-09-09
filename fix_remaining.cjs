const fs = require('fs');
function replace(file, target, repl) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(target, repl);
  fs.writeFileSync(file, content);
}

replace('src/components/TratamentosFormSection.tsx', "tratamento.custoTotal.toFixed", "(tratamento.custoTotal || 0).toFixed");
replace('src/components/VisitForm.tsx', "const selectedIntegrado = integrados.find(i => i.id === selectedId);", "const selectedIntegrado = integrados.find(i => i.id === selectedId) || null;");
replace('src/data.ts', "nome: 'Versão Default',", "// nome: 'Versão Default',");
replace('src/lib/priority.ts', "configs.find(c =>", "configs.find((c: any) =>");
replace('src/lib/whatsapp.ts', "configs.find(c =>", "configs.find((c: any) =>");
replace('src/lib/whatsapp.ts', "const parseScore = (val) => {", "const parseScore = (val?: number) => {");

