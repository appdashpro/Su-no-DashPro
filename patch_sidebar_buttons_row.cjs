const fs = require('fs');
let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

const targetLogic = `      <div className="px-3 py-3 border-t border-slate-800/80 mt-auto flex flex-col gap-1">
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

const replacementLogic = `      <div className="px-3 py-4 border-t border-slate-800/80 mt-auto">
        <div className="flex gap-2 mb-3">
          {onForceSync && (
            <button
              onClick={onForceSync}
              disabled={!isOnline || isSyncing}
              className={\`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-[11px] font-medium border transition-colors \${
                isOnline 
                  ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-400 hover:bg-emerald-900/40' 
                  : 'bg-slate-800/30 border-slate-700/50 text-slate-500 cursor-not-allowed'
              }\`}
            >
              <RefreshCw className={\`w-3.5 h-3.5 \${isSyncing ? 'animate-spin' : ''}\`} />
              <span>{isOnline ? (isSyncing ? '...' : 'Sincronizar') : 'Offline'}</span>
            </button>
          )}

          {onStartTutorial && (
            <button
              id="sidebar-item-tutorial"
              onClick={onStartTutorial}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-[11px] font-medium bg-blue-950/30 border border-blue-800/50 text-blue-300 hover:bg-blue-900/40 transition-colors"
              title="Iniciar Tutorial Guiado"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Tutorial</span>
            </button>
          )}
        </div>

        {lastSyncTime && (
          <div className="text-center text-[10px] text-slate-500/80 font-medium">
            Sinc: {new Date(lastSyncTime).toLocaleDateString('pt-BR')} {new Date(lastSyncTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>`;

content = content.replace(targetLogic, replacementLogic);
fs.writeFileSync('src/components/Sidebar.tsx', content, 'utf8');
