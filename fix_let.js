import fs from 'fs';

let filePath = 'src/components/TratamentosFormSection.tsx';
let code = fs.readFileSync(filePath, 'utf8');

code = code.replace(
  'const newMemory = [...memory];',
  'let newMemory = [...memory];'
);

fs.writeFileSync(filePath, code);
console.log("Fixed const to let");
