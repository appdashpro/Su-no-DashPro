import { safeStorage } from "./safeStorage";
const DB_NAME = 'SuinoDashProBackupDB';
const STORE_NAME = 'backups';
const INTEGRADOS_KEY = 'suino_dashpro_integrados';
const VISITS_KEY = 'suino_dashpro_visits';

export const saveBackupToIndexedDB = async () => {
  return new Promise<void>((resolve, reject) => {
    try {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return resolve();
      }

      const integradosStr = safeStorage.getItem(INTEGRADOS_KEY) || '[]';
      const visitsStr = safeStorage.getItem(VISITS_KEY) || '[]';
      
      const integrados = JSON.parse(integradosStr);
      const visits = JSON.parse(visitsStr);

      const request = indexedDB.open(DB_NAME, 1);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event: any) => {
        const db = event.target.result;
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        const backupData = {
          id: 'latest_backup',
          timestamp: new Date().toISOString(),
          integrados,
          visits
        };

        store.put(backupData);

        transaction.oncomplete = () => {
          db.close();
          console.log('Local backup created successfully in IndexedDB.');
          resolve();
        };

        transaction.onerror = (err: any) => {
          console.error('Backup failed:', err);
          resolve();
        };
      };

      request.onerror = (err: any) => {
        console.error('Failed to open IndexedDB for backup:', err);
        resolve();
      };
    } catch (e) {
      console.error('Exception during backup:', e);
      resolve();
    }
  });
};
