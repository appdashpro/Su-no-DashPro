const fs = require('fs');
let code = fs.readFileSync('src/lib/storage.ts', 'utf8');

const loggerCode = `
export const getSyncLogs = () => {
  try {
    const data = safeStorage.getItem('SYNC_DIAGNOSTIC_LOGS');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};
export const addSyncLog = (message: string, error?: any) => {
  try {
    const logs = getSyncLogs();
    logs.unshift({
      time: new Date().toISOString(),
      message,
      error: error ? (typeof error === 'object' ? JSON.stringify(error) : String(error)) : undefined
    });
    safeStorage.setItem('SYNC_DIAGNOSTIC_LOGS', JSON.stringify(logs.slice(0, 50)));
  } catch (e) {}
};
export const clearSyncLogs = () => {
  safeStorage.removeItem('SYNC_DIAGNOSTIC_LOGS');
};
`;

code = code.replace(
`export const CONFIGS_KEY = "suino_dashpro_empresa_configs";`,
loggerCode + `\nexport const CONFIGS_KEY = "suino_dashpro_empresa_configs";`
);

// Replace console.errors with addSyncLog
code = code.replace(/console\.error\("Erro upserting integrado:", errInt\);/g, 'console.error("Erro upserting integrado:", errInt); addSyncLog("Erro upserting integrado: " + localLote.name, errInt);');
code = code.replace(/console\.error\("Erro upserting lote:", errLote\);/g, 'console.error("Erro upserting lote:", errLote); addSyncLog("Erro upserting lote: " + loteId, errLote);');
code = code.replace(/console\.error\("Erro upsert visita:", errVisita\);/g, 'console.error("Erro upsert visita:", errVisita); addSyncLog("Erro upsert visita: " + v.id, errVisita);');
code = code.replace(/console\.error\("Erro update lote:", errLote\);/g, 'console.error("Erro update lote:", errLote); addSyncLog("Erro update lote from visita: " + loteId, errLote);');
code = code.replace(/console\.error\("Erro insert cargas:", errCargas\);/g, 'console.error("Erro insert cargas:", errCargas); addSyncLog("Erro insert cargas para visita: " + v.id, errCargas);');
code = code.replace(/console\.error\("Erro insert tratamentos:", errTratamentos\);/g, 'console.error("Erro insert tratamentos:", errTratamentos); addSyncLog("Erro insert tratamentos para visita: " + v.id, errTratamentos);');
code = code.replace(/console\.error\('Exception processing visit in saveVisits:', loopErr\);/g, 'console.error("Exception processing visit in saveVisits:", loopErr); addSyncLog("Exception processing visit: " + v.id, loopErr);');
code = code.replace(/console\.error\('Error syncing:', e\);/g, 'console.error("Error syncing:", e); addSyncLog("Error syncing", e);');


fs.writeFileSync('src/lib/storage.ts', code);
