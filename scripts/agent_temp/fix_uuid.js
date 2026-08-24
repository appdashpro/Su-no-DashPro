import fs from 'fs';

let filePath = 'src/lib/storage.ts';
let code = fs.readFileSync(filePath, 'utf8');

code = code.replace(
  'id: t.id || crypto.randomUUID(),',
  'id: (t.id && t.id.length === 36 && t.id.includes("-")) ? t.id : crypto.randomUUID(),'
);

fs.writeFileSync(filePath, code);
