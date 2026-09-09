const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf8');

const regex = /const handleAuth = async \(e: React\.FormEvent\) => \{[\s\S]*?\} finally \{/g;

const restoreLogic = `const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const normEmail = email.trim().toLowerCase();

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: normEmail,
        password,
      });

      if (signInError) throw signInError;

      if (data.user) {
        const profile = await resolveUserProfile(data.user.email || '', data.user.id);
        saveUserProfile(profile);
        cacheAuthSession(data.session);
        if (onLoginSuccess) onLoginSuccess(profile);
      }
    } catch (err: any) {
      // 1. If offline, check if we have cached profile or offline fallback
      if (
        err?.message?.includes('fetch') ||
        err?.message?.includes('Failed') ||
        err?.code === '0' ||
        String(err).includes('fetch')
      ) {
        const profile = await resolveUserProfile(normEmail, 'offline_field');
        saveUserProfile(profile);
        cacheAuthSession({ user: { id: profile.id, email: profile.email } });
        window.dispatchEvent(new CustomEvent('offline-login', { detail: { profile } }));
        if (onLoginSuccess) onLoginSuccess(profile);
        return;
      }
      
      // Simplify error message
      setError('Usuário ou senha incorretos.');
    } finally {`;

code = code.replace(regex, restoreLogic);
fs.writeFileSync('src/components/Login.tsx', code);
