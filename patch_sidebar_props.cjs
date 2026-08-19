const fs = require('fs');
let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

content = content.replace(
  '  onLogout?: () => void;\n}',
  '  onLogout?: () => void;\n  lastSyncTime?: string | null;\n}'
);

content = content.replace(
  'export function Sidebar({ currentTab, setCurrentTab, onStartTutorial, userProfile, onLogout }: SidebarProps) {',
  'export function Sidebar({ currentTab, setCurrentTab, onStartTutorial, userProfile, onLogout, lastSyncTime }: SidebarProps) {'
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

        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair do Sistema</span>
          </button>
        )}
        
        {lastSyncTime && (
          <div className="pt-2 flex justify-center">
            <span className="text-[9px] text-slate-500/70" title="Horário da última sincronização">
              Sinc: {new Date(lastSyncTime).toLocaleDateString('pt-BR')} {new Date(lastSyncTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}
      </div>`;

content = content.replace(/      <div className="p-4 border-t border-slate-800\/80 mt-auto space-y-2">[\s\S]*?<\/div>\n    <\/aside>/m, newSidebarBottom + "\n    </aside>");

fs.writeFileSync('src/components/Sidebar.tsx', content, 'utf8');
