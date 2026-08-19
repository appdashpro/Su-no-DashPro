const fs = require('fs');
let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

const targetLogic = `{userProfile && isMaster && (
          <div className="px-1 mb-1 mt-1">
            <div className="flex items-center justify-between gap-1 mb-0.5">
              <span className="text-xs font-medium text-slate-400 truncate" title={userProfile.papel === 'TECNICO_CLIENTE' || userProfile.papel === 'TECNICO' ? (/^t[é|e]cnico\\s+/i.test(userProfile.nome) ? userProfile.nome : \`Técnico \${userProfile.nome}\`) : userProfile.nome}>
                {userProfile.papel === 'TECNICO_CLIENTE' || userProfile.papel === 'TECNICO' ? (/^t[é|e]cnico\\s+/i.test(userProfile.nome) ? userProfile.nome : \`Técnico \${userProfile.nome}\`) : userProfile.nome}
              </span>
              {userProfile.papel !== 'TECNICO_CLIENTE' && userProfile.papel !== 'TECNICO' && (
                <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider opacity-80 shrink-0", getBadgeStyle())}>
                  {userProfile.papel === 'MASTER' ? 'Master' : 'Nutron'}
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500 truncate" title={userProfile.email}>
              {userProfile.email}
            </p>
          </div>
        )}`;

const replacementLogic = `{userProfile && (
          <div className="px-1 mt-2 py-2 border-t border-slate-800/60">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-medium text-slate-400 truncate" title={userProfile.papel === 'TECNICO_CLIENTE' || userProfile.papel === 'TECNICO' ? (/^t[é|e]cnico\\s+/i.test(userProfile.nome) ? userProfile.nome : \`Técnico \${userProfile.nome}\`) : userProfile.nome}>
                  {userProfile.papel === 'TECNICO_CLIENTE' || userProfile.papel === 'TECNICO' ? (/^t[é|e]cnico\\s+/i.test(userProfile.nome) ? userProfile.nome : \`Técnico \${userProfile.nome}\`) : userProfile.nome}
                </span>
                {(userProfile.papel === 'MASTER' || userProfile.papel === 'TECNICO_NUTRON' || userProfile.papel === 'COORDENADOR') && (
                  <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider opacity-80 shrink-0", getBadgeStyle())}>
                    {userProfile.papel === 'MASTER' ? 'Master' : 'Nutron'}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}`;

content = content.replace(targetLogic, replacementLogic);
fs.writeFileSync('src/components/Sidebar.tsx', content, 'utf8');
