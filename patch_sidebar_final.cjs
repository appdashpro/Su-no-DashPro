const fs = require('fs');
let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

const oldSidebarBottom = `<div className="pt-2 flex flex-col items-center gap-2">
          {onForceSync && (
            <button
              onClick={onForceSync}
              disabled={!isOnline || isSyncing}
              className={\`flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg text-xs font-medium border transition-colors \${
                isOnline 
                  ? 'bg-emerald-950/30 text-emerald-400 border-emerald-800/50 hover:bg-emerald-900/40' 
                  : 'bg-slate-800/50 text-slate-500 border-slate-700/50 cursor-not-allowed'
              }\`}
            >
              <RefreshCw className={\`w-3.5 h-3.5 \${isSyncing ? 'animate-spin' : ''}\`} />
              <span>{isOnline ? (isSyncing ? 'Sincronizando...' : 'Sincronizar Agora') : 'Offline'}</span>
            </button>
          )}

          {lastSyncTime && (
            <span className="text-[9px] text-slate-500/70" title="Horário da última sincronização">
              Sinc: {new Date(lastSyncTime).toLocaleDateString('pt-BR')} {new Date(lastSyncTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>`;

const newSidebarBottom = `<div className="pt-2 flex flex-col items-center gap-2 border-t border-slate-800/50 mt-1 pt-3">
          {onForceSync && (
            <button
              onClick={onForceSync}
              disabled={!isOnline || isSyncing}
              className={\`flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs font-semibold border transition-all \${
                isOnline 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 active:scale-95 shadow-sm' 
                  : 'bg-slate-800/50 text-slate-500 border-slate-700/50 cursor-not-allowed'
              }\`}
            >
              <RefreshCw className={\`w-4 h-4 \${isSyncing ? 'animate-spin text-emerald-300' : ''}\`} />
              <span>{isOnline ? (isSyncing ? 'Sincronizando...' : 'Sincronizar Agora') : 'Offline'}</span>
            </button>
          )}

          {lastSyncTime && (
            <span className="text-[10px] text-slate-500 font-medium" title="Horário da última sincronização">
              Sinc: {new Date(lastSyncTime).toLocaleDateString('pt-BR')} {new Date(lastSyncTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>`;

content = content.replace(oldSidebarBottom, newSidebarBottom);
fs.writeFileSync('src/components/Sidebar.tsx', content, 'utf8');
