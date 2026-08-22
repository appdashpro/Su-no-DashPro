const fs = require('fs');
let content = fs.readFileSync('./src/components/ReferenceCurve.tsx', 'utf8');

const regex = /<div className="w-full sm:w-1\/3">[\s\S]*?<label className="block text-sm font-semibold text-slate-700 mb-1">Versão da Curva<\/label>[\s\S]*?<\/select>\s*<\/div>\s*<\/div>/;
content = content.replace(regex, '');

fs.writeFileSync('./src/components/ReferenceCurve.tsx', content);
