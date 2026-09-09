const fs = require('fs');
let code = fs.readFileSync('src/components/VisitForm.tsx', 'utf8');

code = code.replace(/formattedVisitData\[k\]/g, '(formattedVisitData as any)[k]');
code = code.replace(/cfgs\.find\(c =>/g, 'cfgs.find((c: any) =>');
code = code.replace(/const tCfg = cfgs\.find\(\(c: any\) => c\.empresa_id === \(formData\?\.empresaId\)\);/g, 'const tCfg = cfgs.find((c: any) => c.empresa_id === (formData?.empresaId));');
fs.writeFileSync('src/components/VisitForm.tsx', code);
