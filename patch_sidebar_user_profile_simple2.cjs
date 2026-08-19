const fs = require('fs');
let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

const targetLogic = `{userProfile && (
          <div className="px-3 py-2 mt-4 mb-2 bg-slate-800/30 rounded-xl border border-slate-700/50 flex flex-col justify-center gap-0.5">
            <span className="text-[10px] font-medium text-slate-400/70 uppercase tracking-wider">Acesso logado</span>
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className={\`w-1.5 h-1.5 rounded-full shrink-0 \${isMaster ? 'bg-purple-400' : isNutron ? 'bg-blue-400' : 'bg-emerald-400'}\`}></div>
                <span className="text-xs font-semibold text-slate-200 truncate" title={userProfile.papel === 'TECNICO_CLIENTE' || userProfile.papel === 'TECNICO' ? (/^t[é|e]cnico\\s+/i.test(userProfile.nome) ? userProfile.nome : \`Técnico \${userProfile.nome}\`) : userProfile.nome}>
                  {userProfile.papel === 'TECNICO_CLIENTE' || userProfile.papel === 'TECNICO' ? (/^t[é|e]cnico\\s+/i.test(userProfile.nome) ? userProfile.nome : \`Técnico \${userProfile.nome}\`) : userProfile.nome}
                </span>
              </div>
              {(userProfile.papel === 'MASTER' || userProfile.papel === 'TECNICO_NUTRON' || userProfile.papel === 'COORDENADOR') && (
                <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider opacity-90 shrink-0", getBadgeStyle())}>
                  {userProfile.papel === 'MASTER' ? 'Master' : 'Nutron'}
                </span>
              )}
            </div>
          </div>
        )}`;

const replacementLogic = `{userProfile && (
          <div className="px-1 mt-4 mb-1">
            <div className="flex flex-col justify-center gap-0.5">
              <span className="text-[9px] font-medium text-slate-500 uppercase tracking-wider pl-1">Usuário Logado</span>
              <div className="flex items-center justify-between gap-1 pl-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className={\`w-1.5 h-1.5 rounded-full shrink-0 \${isMaster ? 'bg-purple-400' : isNutron ? 'bg-blue-400' : 'bg-emerald-400'}\`}></div>
                  <span className="text-xs font-semibold text-slate-300 truncate" title={userProfile.papel === 'TECNICO_CLIENTE' || userProfile.papel === 'TECNICO' ? (/^t[é|e]cnico\\s+/i.test(userProfile.nome) ? userProfile.nome : \`Técnico \${userProfile.nome}\`) : userProfile.nome}>
                    {userProfile.papel === 'TECNICO_CLIENTE' || userProfile.papel === 'TECNICO' ? (/^t[é|e]cnico\\s+/i.test(userProfile.nome) ? userProfile.nome : \`Técnico \${userProfile.nome}\`) : userProfile.nome}
                  </span>
                </div>
                {(userProfile.papel === 'MASTER' || userProfile.papel === 'TECNICO_NUTRON' || userProfile.papel === 'COORDENADOR') && (
                  <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider opacity-90 shrink-0", getBadgeStyle())}>
                    {userProfile.papel === 'MASTER' ? 'Master' : 'Nutron'}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}`;

content = content.replace(targetLogic, replacementLogic);
fs.writeFileSync('src/components/Sidebar.tsx', content, 'utf8');
