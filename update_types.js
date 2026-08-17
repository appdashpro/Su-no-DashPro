import fs from 'fs';

let filePath = 'src/types.ts';
let code = fs.readFileSync(filePath, 'utf8');

code = code.replace(
  '  motivo?: string | null;',
  '  motivo?: string | null;\n  concentracao?: number | null;'
);

code = code.replace(
  '  produto: string;',
  '  produto: string;\n  motivo?: string;'
);

fs.writeFileSync(filePath, code);
