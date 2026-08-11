const fs = require('fs');
let code = fs.readFileSync('src/components/VisitForm.tsx', 'utf-8');

code = code.replace(
  `name="integradoNome"`,
  `id="form-integrado-nome"\n              name="integradoNome"`
);

code = code.replace(
  `type="submit"\n            className="w-full`,
  `type="submit"\n            id="form-salvar"\n            className="w-full`
);

fs.writeFileSync('src/components/VisitForm.tsx', code);
console.log('patched VisitForm IDs');
