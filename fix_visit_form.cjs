const fs = require('fs');

let file2 = 'src/components/VisitForm.tsx';
let code2 = fs.readFileSync(file2, 'utf8');

code2 = code2.replace(
  `pesoAmostradoKg={formData.pesoAmostradoKg !== '' ? Number(formData.pesoAmostradoKg) : undefined}`,
  `pesoAmostradoKg={formData.pesoAmostradoKg !== undefined && String(formData.pesoAmostradoKg) !== '' ? Number(formData.pesoAmostradoKg) : undefined}`
);

code2 = code2.replace(
  `onPesoChange={(peso) => setFormData(prev => ({ ...prev, pesoAmostradoKg: peso !== undefined ? String(peso) : '' }))}`,
  `onPesoChange={(peso) => setFormData(prev => ({ ...prev, pesoAmostradoKg: peso !== undefined ? peso : undefined }))}`
);

fs.writeFileSync(file2, code2);

let file1 = 'src/components/TratamentosFormSection.tsx';
let code1 = fs.readFileSync(file1, 'utf8');
code1 = code1.replace(
  `if (t.doseMgKg && newWeight && animaisVivos) {`,
  `if (t.doseMgKg && effectiveNewWeight && animaisVivos) {`
);

fs.writeFileSync(file1, code1);
console.log("Fixed types");
