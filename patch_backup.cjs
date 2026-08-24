const fs = require('fs');
let code = fs.readFileSync('src/lib/backup.ts', 'utf8');

code += `

export const restoreBackupFromIndexedDB = async () => {
  return new Promise<boolean>((resolve) => {
    try {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return resolve(false);
      }

      // Only restore if localStorage is empty or seems cleared
      const integradosStr = safeStorage.getItem(INTEGRADOS_KEY);
      const visitsStr = safeStorage.getItem(VISITS_KEY);
      
      const hasIntegrados = integradosStr && integradosStr.length > 5; // not just '[]'
      const hasVisits = visitsStr && visitsStr.length > 5;

      if (hasIntegrados || hasVisits) {
        // We have data, no need to restore
        return resolve(false);
      }

      const request = indexedDB.open(DB_NAME, 1);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event: any) => {
        const db = event.target.result;
        
        if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.close();
            return resolve(false);
        }

        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const getRequest = store.get('latest_backup');

        getRequest.onsuccess = () => {
          const backupData = getRequest.result;
          if (backupData) {
            if (backupData.integrados && backupData.integrados.length > 0) {
              safeStorage.setItem(INTEGRADOS_KEY, JSON.stringify(backupData.integrados));
            }
            if (backupData.visits && backupData.visits.length > 0) {
              safeStorage.setItem(VISITS_KEY, JSON.stringify(backupData.visits));
            }
            console.log('Successfully restored data from IndexedDB backup:', backupData.timestamp);
            db.close();
            resolve(true);
          } else {
            db.close();
            resolve(false);
          }
        };

        getRequest.onerror = (err: any) => {
          console.error('Failed to read from IndexedDB backup:', err);
          db.close();
          resolve(false);
        };
      };

      request.onerror = (err: any) => {
        console.error('Failed to open IndexedDB for restore:', err);
        resolve(false);
      };

    } catch (e) {
      console.error('Exception during restore:', e);
      resolve(false);
    }
  });
};
`;

fs.writeFileSync('src/lib/backup.ts', code);
