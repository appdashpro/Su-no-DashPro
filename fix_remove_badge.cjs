const fs = require('fs');
let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

const targetLogic = `            <div className="flex items-center justify-between gap-1 mb-0.5">
              <span className="text-xs font-medium text-slate-400 truncate" title={userProfile.papel === 'TECNICO_CLIENTE' || userProfile.papel === 'TECNICO' ? (/^t[é|e]cnico\\s+/i.test(userProfile.nome) ? userProfile.nome : \`Técnico \${userProfile.nome}\`) : userProfile.nome}>
                {userProfile.papel === 'TECNICO_CLIENTE' || userProfile.papel === 'TECNICO' ? (/^t[é|e]cnico\\s+/i.test(userProfile.nome) ? userProfile.nome : \`Técnico \${userProfile.nome}\`) : userProfile.nome}
              </span>
              <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider opacity-80", getBadgeStyle())}>
                {userProfile.papel === 'MASTER' ? 'Master' : userProfile.papel === 'TECNICO_NUTRON' ? 'Téc. Nutron' : 'Cliente'}
              </span>
            </div>`;

const replacementLogic = `            <div className="flex items-center justify-between gap-1 mb-0.5">
              <span className="text-xs font-medium text-slate-400 truncate" title={userProfile.papel === 'TECNICO_CLIENTE' || userProfile.papel === 'TECNICO' ? (/^t[é|e]cnico\\s+/i.test(userProfile.nome) ? userProfile.nome : \`Técnico \${userProfile.nome}\`) : userProfile.nome}>
                {userProfile.papel === 'TECNICO_CLIENTE' || userProfile.papel === 'TECNICO' ? (/^t[é|e]cnico\\s+/i.test(userProfile.nome) ? userProfile.nome : \`Técnico \${userProfile.nome}\`) : userProfile.nome}
              </span>
              {userProfile.papel !== 'TECNICO_CLIENTE' && userProfile.papel !== 'TECNICO' && (
                <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider opacity-80 shrink-0", getBadgeStyle())}>
                  {userProfile.papel === 'MASTER' ? 'Master' : 'Nutron'}
                </span>
              )}
            </div>`;

content = content.replace(targetLogic, replacementLogic);
fs.writeFileSync('src/components/Sidebar.tsx', content, 'utf8');
