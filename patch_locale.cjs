const fs = require('fs');

const patchFile = (filename, replacements) => {
  if (!fs.existsSync(filename)) return;
  let content = fs.readFileSync(filename, 'utf8');
  for (const [search, replace] of replacements) {
    content = content.replace(search, replace);
  }
  fs.writeFileSync(filename, content);
};

patchFile('src/components/Integrados.tsx', [
  ['a.name.localeCompare(b.name)', '(a.name || "").localeCompare(b.name || "")'],
  ['b.name.localeCompare(a.name)', '(b.name || "").localeCompare(a.name || "")']
]);

patchFile('src/components/MedicationAnalysis.tsx', [
  ['a.key.localeCompare(b.key)', '(a.key || "").localeCompare(b.key || "")']
]);

patchFile('src/components/LoteReportModal.tsx', [
  ['a.dataVigencia.localeCompare(b.dataVigencia)', '(a.dataVigencia || "").localeCompare(b.dataVigencia || "")']
]);

patchFile('src/components/ReferenceCurve.tsx', [
  ['b.dataVigencia.localeCompare(a.dataVigencia)', '(b.dataVigencia || "").localeCompare(a.dataVigencia || "")'],
  ['b.dataVigencia.localeCompare(a.dataVigencia)', '(b.dataVigencia || "").localeCompare(a.dataVigencia || "")']
]);

patchFile('src/components/UsuariosGestao.tsx', [
  ['a.name.localeCompare(b.name)', '(a.name || "").localeCompare(b.name || "")']
]);

patchFile('src/data.ts', [
  ['a.dataVigencia.localeCompare(b.dataVigencia)', '(a.dataVigencia || "").localeCompare(b.dataVigencia || "")']
]);

console.log("Patched other localeCompares");
