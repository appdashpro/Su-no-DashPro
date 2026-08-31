const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const hookStr = `
 const handleLogout = useCallback(async () => {
   clearAuthCache();
   setCurrentUserProfile(null);
    setMasterUserProfile(null);
   setSession(null);
   try {
     await supabase.auth.signOut();
   } catch (e) {
     console.warn('Logout error:', e);
   }
 }, []);

 useEffect(() => {
   const onSessionExpired = () => {
     handleLogout();
     alert("Sua sessão expirou ou você acessou a rede após trabalhar offline. Por favor, faça login novamente para sincronizar seus dados.");
   };
   window.addEventListener('session-expired', onSessionExpired);
   return () => window.removeEventListener('session-expired', onSessionExpired);
 }, [handleLogout]);
`;

code = code.replace(hookStr, '');

const index = code.indexOf('if (loading) {');
code = code.substring(0, index) + hookStr + '\n' + code.substring(index);

fs.writeFileSync('src/App.tsx', code);
