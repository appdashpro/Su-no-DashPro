const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  '   lastSyncTime={lastSyncTime}\n />',
  '   lastSyncTime={lastSyncTime}\n   isOnline={isOnline}\n   isSyncing={isSyncing}\n   onForceSync={handleForceSync}\n />'
);

const oldHeaderSyncBtn = ` <div className="flex items-center gap-1 sm:gap-2 mr-0 sm:mr-2">
 {isOnline ? (
 <button 
 onClick={handleForceSync}
 disabled={isSyncing}
 className={\`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-full transition-colors border \${
   syncRetryStatus 
     ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100' 
     : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
 }\`}
 title={syncRetryStatus ? \`Sincronizando: \${syncRetryStatus}\` : "Sincronizar dados agora"}
 >
 <Wifi className="w-3.5 h-3.5" />
 <span className="hidden sm:inline">{syncRetryStatus || (isSyncing ? 'Sincronizando...' : 'Online')}</span>
 {isSyncing && <RefreshCw className="w-3 h-3 animate-spin ml-1" />}
 </button>
 ) : (
 <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-amber-50 text-amber-700 rounded-full border border-amber-200">
 <WifiOff className="w-3.5 h-3.5" />
 <span className="hidden sm:inline">Offline</span>
 </div>
 )}
 </div>`;

const newHeaderSyncBtn = ``;

content = content.replace(oldHeaderSyncBtn, newHeaderSyncBtn);

const oldHeaderLogoutBtn = ` <button onClick={handleLogout} className="text-slate-500 hover:text-slate-700 flex items-center gap-1 text-sm font-medium transition-colors" title="Sair">
 <LogOut className="w-5 h-5" />
 </button>`;

const newHeaderLogoutBtn = ` <button onClick={handleLogout} className="text-slate-500 hover:text-slate-700 flex items-center gap-1 text-sm font-medium transition-colors bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg" title="Sair do Sistema">
 <LogOut className="w-4 h-4" />
 <span className="hidden sm:inline text-xs font-semibold">Sair</span>
 </button>`;

content = content.replace(oldHeaderLogoutBtn, newHeaderLogoutBtn);

fs.writeFileSync('src/App.tsx', content, 'utf8');
