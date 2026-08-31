const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const syncTarget = ` const syncInBackground = useCallback(async (isManual = false) => {
 if (isSyncInProgressRef.current) return;
 if (typeof navigator !== 'undefined' && !navigator.onLine) {
   setIsOnline(false);
   setIsSyncing(false);
   return;
 }`;

const syncReplacement = ` const syncInBackground = useCallback(async (isManual = false) => {
 if (isSyncInProgressRef.current) return;
 
 // Se estivermos usando uma sessão offline mockada, não tentamos sincronizar
 const cachedSession = getCachedAuthSession();
 if (cachedSession?.user?.id?.includes('offline')) {
    setIsSyncing(false);
    return;
 }
 
 if (typeof navigator !== 'undefined' && !navigator.onLine) {
   setIsOnline(false);
   setIsSyncing(false);
   return;
 }`;

if (code.includes(syncTarget)) {
    code = code.replace(syncTarget, syncReplacement);
    if (!code.includes('getCachedAuthSession')) {
        code = code.replace(/import \{ resolveUserProfile, saveUserProfile, cacheAuthSession, getSavedUserProfile \} from '\.\/lib\/auth';/, "import { resolveUserProfile, saveUserProfile, cacheAuthSession, getSavedUserProfile, getCachedAuthSession } from './lib/auth';");
    }
    fs.writeFileSync('src/App.tsx', code);
    console.log("Replaced successfully!");
} else {
    console.log("Could not find target!");
}
