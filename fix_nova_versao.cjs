const fs = require('fs');
const path = './src/components/ReferenceCurve.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /<button[\s\S]*?onClick=\{\(\) => \{\s*setIsAddingCurva\(true\);[\s\S]*?Nova Versão\s*<\/button>/g;
content = content.replace(regex, '');

// Also change the descriptive text
content = content.replace(
  '<p className="text-xs text-slate-500">Gerencie as versões de curvas para os cálculos deste cliente.</p>',
  '<p className="text-xs text-slate-500">Visualização do histórico de curvas para este cliente.</p>'
);

content = content.replace(
  'Utilize o painel acima para adicionar uma nova versão.',
  'Entre em contato com o suporte para adicionar uma nova versão.'
);

fs.writeFileSync(path, content);
