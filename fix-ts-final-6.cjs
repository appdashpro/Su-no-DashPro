const fs = require('fs');

let f5 = 'src/components/VisitForm.tsx';
if (fs.existsSync(f5)) {
  let c = fs.readFileSync(f5, 'utf8');
  c = c.replace(/formData\.idade !== ''/g, "String(formData.idade) !== ''");
  fs.writeFileSync(f5, c);
}
