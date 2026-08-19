const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  'className="hidden sm:flex items-center gap-1.5 bg-amber-100 text-amber-800 text-[11px] font-bold px-3 py-1.5 rounded-full border border-amber-300 hover:bg-amber-200 transition-colors mr-2"',
  'className="flex items-center gap-1 sm:gap-1.5 bg-purple-100 text-purple-800 text-[10px] sm:text-[11px] font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-purple-300 hover:bg-purple-200 transition-colors mr-1 sm:mr-2"'
);

fs.writeFileSync('src/App.tsx', content, 'utf8');
