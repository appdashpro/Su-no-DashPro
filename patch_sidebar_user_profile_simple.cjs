const fs = require('fs');
let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

const targetLogic = `{userProfile && (
          <div className="px-1 mb-2 mt-4">
            <div className="flex flex-col justify-center">
              <span className="text-[11px] font-medium text-slate-400/80 uppercase tracking-wider mb-1">Acesso atual</span>
              <div className="flex items-center justify-between gap-1 bg-slate-800/30 px-2 py-1.5 rounded-lg border border-slate-800/50">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className={\`w-2 h-2 rounded-full shrink-0 \${isMaster ? 'bg-purple-400' : isNutron ? 'bg-blue-400' : 'bg-emerald-400'}\`}></div>
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

const replacementLogic = `{userProfile && (
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

content = content.replace(targetLogic, replacementLogic);
fs.writeFileSync('src/components/Sidebar.tsx', content, 'utf8');
