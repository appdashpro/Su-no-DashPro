const fs = require('fs');

function fixFile(path, regex, replacement) {
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(regex, replacement);
  fs.writeFileSync(path, content);
}

fixFile('src/components/CopagriMigration.tsx', /\(c\) =>/g, '(c: any) =>');
fixFile('src/components/CopagriUpdate.tsx', /\(c\) =>/g, '(c: any) =>');
fixFile('src/components/EmpresaConfigGestao.tsx', /b: parseFloat\(e.target.value\) \|\| ''/g, 'b: parseFloat(e.target.value) || 0');
fixFile('src/components/EmpresaConfigGestao.tsx', /pm: parseFloat\(e.target.value\) \|\| ''/g, 'pm: parseFloat(e.target.value) || 0');
fixFile('src/components/EmpresaConfigGestao.tsx', /em: parseFloat\(e.target.value\) \|\| ''/g, 'em: parseFloat(e.target.value) || 0');
fixFile('src/components/EmpresaConfigGestao.tsx', /pi: parseFloat\(e.target.value\) \|\| ''/g, 'pi: parseFloat(e.target.value) || 0');
fixFile('src/components/EmpresaConfigGestao.tsx', /value=\{priorityMortalityWeights\.(\w+)\} \/\/ Allow empty string/g, 'value={priorityMortalityWeights.$1 === 0 ? "" : priorityMortalityWeights.$1}');

fixFile('src/components/SystemCurvesMigration.tsx', /\(c\) =>/g, '(c: any) =>');

fixFile('src/components/VisitForm.tsx', /formData\.idade_semana === '0'/g, 'formData.idade_semana === 0');
fixFile('src/data.ts', /faseName =>/g, '(faseName: any) =>');
fixFile('src/data.ts', /f =>/g, '(f: any) =>');

console.log('Fixed TS errors');
