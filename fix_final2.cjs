const fs = require('fs');

function replaceAllInFile(file, regex, repl) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(regex, repl);
  fs.writeFileSync(file, content);
}

replaceAllInFile('src/components/VisitForm.tsx', /integrado = integrados\.find\(i => i\.id === \(initialData\?\.integradoId \|\| formData\.integradoId\)\);/g, 'integrado = integrados.find(i => i.id === (initialData?.integradoId || formData.integradoId)) || null;');
replaceAllInFile('src/lib/priority.ts', /getEmpresaConfigsLocal\(\)\.find\(c =>/g, 'getEmpresaConfigsLocal().find((c: any) =>');
replaceAllInFile('src/lib/whatsapp.ts', /cfgs\.find\(c =>/g, 'cfgs.find((c: any) =>');
replaceAllInFile('src/lib/whatsapp.ts', /getStatusText = \(val\) =>/g, 'getStatusText = (val?: number) =>');

