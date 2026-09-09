const fs = require('fs');

function replace(file, target, repl) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(target, repl);
  fs.writeFileSync(file, content);
}

replace('src/components/Login.tsx', "if (\n        err?.message?.includes('fetch') ||", "if (\n        err?.message?.includes('fetch') ||"); // Wait, I already replaced it but it still gives err. Let's look at Login.tsx
replace('src/components/TratamentosFormSection.tsx', "R$ {tratamento.custoTotal.toFixed(2)}", "R$ {(tratamento.custoTotal || 0).toFixed(2)}");
replace('src/components/VisitForm.tsx', "(initialData.empresaId || integrado?.empresaId)", "(integrado?.empresaId)");
replace('src/components/VisitForm.tsx', "const selectedIntegrado = integrados.find(i => i.id === selectedId);", "const selectedIntegrado = integrados.find(i => i.id === selectedId) || null;");
replace('src/data.ts', "nome: 'Versão Default',", "// nome: 'Versão Default',");
replace('src/lib/priority.ts', "configs.find(c =>", "configs.find((c: any) =>");
replace('src/lib/whatsapp.ts', "configs.find(c =>", "configs.find((c: any) =>");
replace('src/lib/whatsapp.ts', "const parseScore = (val) => {", "const parseScore = (val?: number) => {");

