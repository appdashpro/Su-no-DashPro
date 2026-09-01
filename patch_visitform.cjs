const fs = require('fs');
let code = fs.readFileSync('src/components/VisitForm.tsx', 'utf8');

code = code.replace(
  "import { TratamentosFormSection } from './TratamentosFormSection';",
  "import { TratamentosFormSection } from './TratamentosFormSection';\nimport { EntregasFormSection } from './EntregasFormSection';"
);

code = code.replace(
  "causasMortalidade={currentConfig?.causas_mortalidade} />",
  "causasMortalidade={currentConfig?.causas_mortalidade} />\n\n        <EntregasFormSection\n          empresaId={formData.empresaId || formData.empresa_id || selectedEmpresaId || ''}\n          entregas={formData.entregas || []}\n          onChange={(entregas) => setFormData(prev => ({ ...prev, entregas }))}\n        />"
);

fs.writeFileSync('src/components/VisitForm.tsx', code);
