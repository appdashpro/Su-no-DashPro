import fs from 'fs';

let filePath = 'src/components/TratamentosFormSection.tsx';
let code = fs.readFileSync(filePath, 'utf8');

code = code.replace(
  'id: Math.random().toString(36).substring(7),',
  'id: crypto.randomUUID(),'
);

fs.writeFileSync(filePath, code);
