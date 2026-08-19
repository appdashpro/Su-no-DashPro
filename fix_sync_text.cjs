const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetLogic = `Última sinc: {new Date(lastSyncTime).toLocaleDateString('pt-BR')} {new Date(lastSyncTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
 {lastSyncUser && lastSyncUser !== 'offline' && lastSyncUser !== 'Usuário logado' ? \` (\${lastSyncUser.split('@')[0]})\` : ''}
 </span>`;

const replacementLogic = `Última sinc: {new Date(lastSyncTime).toLocaleDateString('pt-BR')} {new Date(lastSyncTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
 </span>`;

content = content.replace(targetLogic, replacementLogic);
fs.writeFileSync('src/App.tsx', content, 'utf8');
