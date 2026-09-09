const fs = require('fs');

function replaceAllInFile(file, replacerFn) {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = replacerFn(content);
  fs.writeFileSync(file, newContent);
}

// Login
replaceAllInFile('src/components/Login.tsx', text => text.replace(/catch \(error\)/g, 'catch (err)'));

// Dashboard
replaceAllInFile('src/components/Dashboard.tsx', text => text.replace(/configs\.find\(c =>/g, 'configs.find((c: any) =>'));

// Prioridades
replaceAllInFile('src/components/Prioridades.tsx', text => text.replace(/configs\.find\(c =>/g, 'configs.find((c: any) =>'));

// TratamentosFormSection
replaceAllInFile('src/components/TratamentosFormSection.tsx', text => text.replace(/tratamento\.custoTotal\.toFixed/g, '(tratamento.custoTotal || 0).toFixed'));

// VisitForm
replaceAllInFile('src/components/VisitForm.tsx', text => {
  text = text.replace(/configs\.find\(c =>/g, 'configs.find((c: any) =>');
  text = text.replace(/configs\.find\(\(c\) =>/g, 'configs.find((c: any) =>');
  text = text.replace(/configs\.find\(\(c: any\) => c\.empresa_id === Visit\.empresaId\)/g, 'configs.find((c: any) => c.empresa_id === integrados.find(i => i.id === initialValues.integradoId)?.empresaId)');
  text = text.replace(/const selectedIntegrado = integrados\.find\(i => i\.id === selectedId\);/g, 'const selectedIntegrado = integrados.find(i => i.id === selectedId) || null;');
  text = text.replace(/initialValues\[key\] !== value/g, '(initialValues as any)[key] !== value');
  return text;
});

// Visits
replaceAllInFile('src/components/Visits.tsx', text => text.replace(/configs\.find\(c =>/g, 'configs.find((c: any) =>'));

// data.ts
replaceAllInFile('src/data.ts', text => text.replace(/nome: 'Versão/g, '// nome: \'Versão'));

// priority.ts
replaceAllInFile('src/lib/priority.ts', text => text.replace(/configs\.find\(c =>/g, 'configs.find((c: any) =>'));

// whatsapp.ts
replaceAllInFile('src/lib/whatsapp.ts', text => {
  text = text.replace(/configs\.find\(c =>/g, 'configs.find((c: any) =>');
  text = text.replace(/parseScore = \(val\) =>/g, 'parseScore = (val?: number) =>');
  return text;
});
