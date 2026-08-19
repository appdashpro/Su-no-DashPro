const fs = require('fs');
let file = 'src/components/VisitForm.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  " <TratamentosFormSection ",
  ` <TratamentosFormSection 
 pesoAmostradoKg={formData.pesoAmostradoKg !== '' ? Number(formData.pesoAmostradoKg) : undefined}
 onPesoChange={(peso) => setFormData(prev => ({ ...prev, pesoAmostradoKg: peso !== undefined ? String(peso) : '' }))}`
);

fs.writeFileSync(file, code);
console.log("Patched VisitForm");
