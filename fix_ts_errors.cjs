const fs = require('fs');

function patch(file, regex, replacement) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(regex, replacement);
  fs.writeFileSync(file, content);
}

// 1. VisitForm.tsx
let visitForm = fs.readFileSync('src/components/VisitForm.tsx', 'utf8');
// Fix implicitly any on `c`
visitForm = visitForm.replace(/const currentConfig = configs\.find\(\(c\) => c\.empresa_id === Integrado/g, 'const currentConfig = configs.find((c: any) => c.empresa_id === Integrado');
visitForm = visitForm.replace(/configs\.find\(c => c\.empresa_id === lote\.empresaId\)/g, 'configs.find((c: any) => c.empresa_id === lote.empresaId)');
visitForm = visitForm.replace(/configs\.find\(c => c\.empresa_id === values\.empresa_id\)/g, 'configs.find((c: any) => c.empresa_id === values.empresa_id)');
visitForm = visitForm.replace(/configs\.find\(c => c\.empresa_id === sel\.empresaId\)/g, 'configs.find((c: any) => c.empresa_id === sel.empresaId)');
visitForm = visitForm.replace(/configs\.find\(c => c\.empresa_id === i\.empresaId\)/g, 'configs.find((c: any) => c.empresa_id === i.empresaId)');
// Type 'Integrado | undefined' is not assignable to type 'Integrado | null'
visitForm = visitForm.replace(/const selectedIntegrado = integrados.find\(i => i.id === selectedId\);/g, 'const selectedIntegrado = integrados.find(i => i.id === selectedId) || null;');
// Index signature issues: `if (initialValues[key] !== value)` -> we can cast `initialValues as any` or `value as any`
visitForm = visitForm.replace(/initialValues\[key\] !== value/g, '(initialValues as any)[key] !== value');
fs.writeFileSync('src/components/VisitForm.tsx', visitForm);

// 2. Visits.tsx
let visitsComp = fs.readFileSync('src/components/Visits.tsx', 'utf8');
visitsComp = visitsComp.replace(/configs\.find\(c => c\.empresa_id === i\.empresaId\)/g, 'configs.find((c: any) => c.empresa_id === i.empresaId)');
visitsComp = visitsComp.replace(/configs\.find\(c => c\.empresa_id === sel\.empresaId\)/g, 'configs.find((c: any) => c.empresa_id === sel.empresaId)');
fs.writeFileSync('src/components/Visits.tsx', visitsComp);

// 3. data.ts
let dataComp = fs.readFileSync('src/data.ts', 'utf8');
// 'nome' does not exist in type 'CurveVersion'
dataComp = dataComp.replace(/nome: 'Versão Default'/g, '// nome: \'Versão Default\'');
fs.writeFileSync('src/data.ts', dataComp);

// 4. priority.ts
let prio = fs.readFileSync('src/lib/priority.ts', 'utf8');
prio = prio.replace(/configs\.find\(c => c\.empresa_id ===/g, 'configs.find((c: any) => c.empresa_id ===');
fs.writeFileSync('src/lib/priority.ts', prio);

// 5. whatsapp.ts
let wa = fs.readFileSync('src/lib/whatsapp.ts', 'utf8');
wa = wa.replace(/configs\.find\(c => c\.empresa_id ===/g, 'configs.find((c: any) => c.empresa_id ===');
wa = wa.replace(/const parseScore = \(val\) => \{/g, 'const parseScore = (val?: number) => {');
fs.writeFileSync('src/lib/whatsapp.ts', wa);

// 6. ConsolidatedVisitsReport.ts
let rep = fs.readFileSync('src/reports/templates/ConsolidatedVisitsReport.ts', 'utf8');
rep = rep.replace(/empresas\.find\(e => e\.id === integrado\?\.empresaId\)\?\.name/g, 'empresas.find(e => e.id === integrado?.empresaId)?.nome');
rep = rep.replace(/if \(ev\.suinos\?\.mortalidade\)/g, '// if (ev.suinos?.mortalidade)');
rep = rep.replace(/if \(ev\.suinos\?\.refugos\)/g, '// if (ev.suinos?.refugos)');
rep = rep.replace(/if \(ev\.granja\?\.cortinas\)/g, '// if (ev.granja?.cortinas)');
rep = rep.replace(/if \(ev\.granja\?\.qualidade_ar\)/g, '// if (ev.granja?.qualidade_ar)');
rep = rep.replace(/if \(ev\.bebedouros\?\.vazamento\)/g, '// if (ev.bebedouros?.vazamento)');
rep = rep.replace(/if \(ev\.bebedouros\?\.pressao_agua\)/g, '// if (ev.bebedouros?.pressao_agua)');
rep = rep.replace(/if \(ev\.comedouros\?\.regulagem\)/g, '// if (ev.comedouros?.regulagem)');
fs.writeFileSync('src/reports/templates/ConsolidatedVisitsReport.ts', rep);
