const fs = require('fs');
let code = fs.readFileSync('src/lib/storage.ts', 'utf8');

if (!code.includes('getCachedAuthSession')) {
    code = code.replace(/import \{ ([^}]+) \} from '\.\.\/lib\/auth';/, "import { $1, getCachedAuthSession } from '../lib/auth';");
    if (!code.includes('getCachedAuthSession')) {
        code = code.replace(/import \{ safeStorage \} from "\.\/safeStorage";/, 'import { safeStorage } from "./safeStorage";\nimport { getCachedAuthSession } from "./auth";');
    }
}

const syncTarget = `      if (typeof navigator !== 'undefined' && !navigator.onLine) return false;
      if (typeof window !== 'undefined' && safeStorage.getItem('EDITING_LOCK') === 'true') return false;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user.id === 'offline') {
          if (typeof window !== 'undefined') window.dispatchEvent(new Event('session-expired'));
          throw new Error("Sessão expirada ou inválida. Por favor, faça login novamente.");
      }`;

const syncReplacement = `      if (typeof navigator !== 'undefined' && !navigator.onLine) return false;
      if (typeof window !== 'undefined' && safeStorage.getItem('EDITING_LOCK') === 'true') return false;
      
      const cachedSession = getCachedAuthSession();
      if (cachedSession?.user?.id?.includes('offline')) {
          return false; // Skip sync silently for offline sessions
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user.id === 'offline') {
          if (typeof window !== 'undefined') window.dispatchEvent(new Event('session-expired'));
          throw new Error("Sessão expirada ou inválida. Por favor, faça login novamente.");
      }`;

code = code.replace(syncTarget, syncReplacement);
fs.writeFileSync('src/lib/storage.ts', code);
