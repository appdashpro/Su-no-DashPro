const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetLogic = `<span className="text-[10px] text-slate-400 whitespace-nowrap" title={\`Sincronizado por: \${lastSyncUser && lastSyncUser !== 'offline' ? lastSyncUser : 'Você'}\`}>`;

const replacementLogic = `<span className="text-[10px] text-slate-400 whitespace-nowrap" title="Horário da última sincronização">`;

content = content.replace(targetLogic, replacementLogic);
fs.writeFileSync('src/App.tsx', content, 'utf8');
