const fs = require('fs');
let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

content = content.replace(
  '  lastSyncTime?: string | null;\n}',
  '  lastSyncTime?: string | null;\n  isOnline?: boolean;\n  isSyncing?: boolean;\n  onForceSync?: () => void;\n}'
);

content = content.replace(
  'export function Sidebar({ currentTab, setCurrentTab, onStartTutorial, userProfile, onLogout, lastSyncTime }: SidebarProps) {',
  'export function Sidebar({ currentTab, setCurrentTab, onStartTutorial, userProfile, onLogout, lastSyncTime, isOnline, isSyncing, onForceSync }: SidebarProps) {'
);

const newSidebarBottom = `      <div className="p-4 border-t border-slate-800/80 mt-auto space-y-2">
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
        
        <div className="pt-2 flex flex-col items-center gap-2">
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
        </div>
      </div>`;

content = content.replace(/      <div className="p-4 border-t border-slate-800\/80 mt-auto space-y-2">[\s\S]*?<\/div>\n    <\/aside>/m, newSidebarBottom + "\n    </aside>");

fs.writeFileSync('src/components/Sidebar.tsx', content, 'utf8');
