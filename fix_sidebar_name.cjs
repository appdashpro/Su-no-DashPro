const fs = require('fs');
let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

const targetLogic = `<span className="text-xs font-medium text-slate-400 truncate" title={userProfile.nome}>
                {userProfile.nome}
              </span>`;

const replacementLogic = `<span className="text-xs font-medium text-slate-400 truncate" title={userProfile.papel === 'TECNICO_CLIENTE' || userProfile.papel === 'TECNICO' ? (/^t[é|e]cnico\\s+/i.test(userProfile.nome) ? userProfile.nome : \`Técnico \${userProfile.nome}\`) : userProfile.nome}>
                {userProfile.papel === 'TECNICO_CLIENTE' || userProfile.papel === 'TECNICO' ? (/^t[é|e]cnico\\s+/i.test(userProfile.nome) ? userProfile.nome : \`Técnico \${userProfile.nome}\`) : userProfile.nome}
              </span>`;

content = content.replace(targetLogic, replacementLogic);
fs.writeFileSync('src/components/Sidebar.tsx', content, 'utf8');
