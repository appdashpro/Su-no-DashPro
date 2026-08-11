const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /<h1 className="text-lg md:text-xl font-bold text-slate-800 truncate">\{getPageTitle\(\)\}<\/h1>/,
  '<h1 id="header-title" className="text-lg md:text-xl font-bold text-slate-800 truncate">{getPageTitle()}</h1>'
);

fs.writeFileSync('src/App.tsx', code);
console.log('patched header-title in App.tsx');
