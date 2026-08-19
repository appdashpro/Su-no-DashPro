const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  '<Sidebar \n   currentTab={currentTab.startsWith(\'visitas\') ? \'visitas\' : currentTab} \n   setCurrentTab={handleTabChange} \n   onStartTutorial={() => { setRunTutorial(true); setIsSidebarOpen(false); }}\n   userProfile={currentUserProfile}\n   onLogout={handleLogout}\n />',
  '<Sidebar \n   currentTab={currentTab.startsWith(\'visitas\') ? \'visitas\' : currentTab} \n   setCurrentTab={handleTabChange} \n   onStartTutorial={() => { setRunTutorial(true); setIsSidebarOpen(false); }}\n   userProfile={currentUserProfile}\n   onLogout={handleLogout}\n   lastSyncTime={lastSyncTime}\n />'
);

const oldHeaderSync = `<div className="hidden lg:flex flex-col items-end justify-center mr-2">
 <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Data: {new Date().toLocaleDateString('pt-BR')}</span>
 {lastSyncTime && (
 <span className="text-[10px] text-slate-400 whitespace-nowrap" title="Horário da última sincronização">
 Última sinc: {new Date(lastSyncTime).toLocaleDateString('pt-BR')} {new Date(lastSyncTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
 </span>
 )}
 </div>`;

const newHeaderSync = `<div className="hidden lg:flex flex-col items-end justify-center mr-2">
 <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Data: {new Date().toLocaleDateString('pt-BR')}</span>
 </div>`;

content = content.replace(oldHeaderSync, newHeaderSync);
fs.writeFileSync('src/App.tsx', content, 'utf8');
