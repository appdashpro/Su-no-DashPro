const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

if (!code.includes('MedicamentoConfig')) {
  code = code.replace(
    'export interface EmpresaConfig {',
    'export interface MedicamentoConfig {\n  nome: string;\n  custoPorKg?: number;\n}\n\nexport interface EmpresaConfig {'
  );
  code = code.replace(
    'medicamentos_permitidos: string[];',
    'medicamentos_permitidos: (string | MedicamentoConfig)[];'
  );
  fs.writeFileSync('src/types.ts', code);
  console.log('types.ts updated');
} else {
  console.log('types.ts already updated');
}
