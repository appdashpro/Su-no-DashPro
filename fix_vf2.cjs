const fs = require('fs');

function replaceAllInFile(file, regex, repl) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(regex, repl);
  fs.writeFileSync(file, content);
}

replaceAllInFile('src/components/TratamentosFormSection.tsx', /tratamento\.custoTotal > 0/g, '(tratamento.custoTotal || 0) > 0');
replaceAllInFile('src/components/TratamentosFormSection.tsx', /R\$ \{tratamento\.custoTotal\}/g, 'R$ {tratamento.custoTotal || 0}');
replaceAllInFile('src/components/VisitForm.tsx', /const selectedIntegrado = integrados\.find\(i => i\.id === selectedId\);/g, 'const selectedIntegrado = integrados.find(i => i.id === selectedId) || null;');
replaceAllInFile('src/data.ts', /nome: 'Curva Grupo BTZ',/g, '// nome: \'Curva Grupo BTZ\',');
replaceAllInFile('src/data.ts', /nome: 'Curva Bugio',/g, '// nome: \'Curva Bugio\',');
replaceAllInFile('src/lib/priority.ts', /configs\.find\(c => /g, 'configs.find((c: any) => ');
replaceAllInFile('src/lib/whatsapp.ts', /configs\.find\(c =>/g, 'configs.find((c: any) =>');
replaceAllInFile('src/lib/whatsapp.ts', /parseScore = \(val\) =>/g, 'parseScore = (val?: number) =>');

