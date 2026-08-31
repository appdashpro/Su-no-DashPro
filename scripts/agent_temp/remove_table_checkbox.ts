import fs from 'fs';
let content = fs.readFileSync('src/components/Integrados.tsx', 'utf-8');

// Remove header checkbox
const headerRegex = /<th className="px-3 py-2 text-xs whitespace-nowrap bg-slate-50 text-center w-8">[\s\n]*<input[\s\n]*type="checkbox"[\s\S]*?<\/th>/m;
content = content.replace(headerRegex, '');

// Remove body checkbox
const bodyRegex = /<td className="px-3 py-2 text-center whitespace-nowrap">[\s\n]*<input[\s\n]*type="checkbox"[\s\S]*?<\/td>/m;
content = content.replace(new RegExp(bodyRegex.source, 'gm'), '');

fs.writeFileSync('src/components/Integrados.tsx', content);
