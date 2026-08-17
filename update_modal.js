import fs from 'fs';

let filePath = 'src/components/Integrados.tsx';
let code = fs.readFileSync(filePath, 'utf8');

code = code.replace(
  'Tem certeza que deseja apagar este lote? Esta ação removerá o lote permanentemente e não poderá ser desfeita.',
  'Tem certeza que deseja apagar este lote? Esta ação removerá o lote permanentemente e todos os seus registros de visita também serão perdidos. Esta ação não poderá ser desfeita.'
);

fs.writeFileSync(filePath, code);
