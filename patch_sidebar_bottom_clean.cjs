const fs = require('fs');
let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

const targetLogic = `      <div className="p-4 border-t border-slate-800/80 mt-auto space-y-2">
        {onStartTutorial && (
          <button
            id="sidebar-item-tutorial"
            onClick={onStartTutorial}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 transition-all active:scale-95 shadow-sm"
            title="Iniciar Tutorial Guiado"
          >
            <HelpCircle className="w-4 h-4 text-blue-400" />
            <span>Tutorial Guiado</span>
          </button>
        )}
        
        <div className="pt-2 flex flex-col items-center gap-2 border-t border-slate-800/50 mt-1 pt-3">
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
        </div>
      </div>`;

const replacementLogic = `      <div className="px-3 py-3 border-t border-slate-800/80 mt-auto flex flex-col gap-1">
        {onStartTutorial && (
          <button
            id="sidebar-item-tutorial"
            onClick={onStartTutorial}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-medium text-slate-400 hover:text-blue-300 hover:bg-slate-800/50 transition-colors"
            title="Iniciar Tutorial Guiado"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Tutorial Guiado</span>
          </button>
        )}
        
        {onForceSync && (
          <button
            onClick={onForceSync}
            disabled={!isOnline || isSyncing}
            className={\`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[11px] font-medium transition-colors \${
              isOnline 
                ? 'text-slate-400 hover:text-emerald-300 hover:bg-slate-800/50' 
                : 'text-slate-600 cursor-not-allowed'
            }\`}
          >
            <div className="flex items-center gap-2.5">
              <RefreshCw className={\`w-3.5 h-3.5 \${isSyncing ? 'animate-spin text-emerald-400' : ''}\`} />
              <span>{isOnline ? (isSyncing ? 'Sincronizando...' : 'Sincronizar') : 'Offline'}</span>
            </div>
            {lastSyncTime && !isSyncing && isOnline && (
              <span className="text-[9px] text-slate-500 font-normal">
                {new Date(lastSyncTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </button>
        )}
      </div>`;

content = content.replace(targetLogic, replacementLogic);
fs.writeFileSync('src/components/Sidebar.tsx', content, 'utf8');
