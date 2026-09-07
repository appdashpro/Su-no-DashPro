const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf8');

const replacement = `
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
`;

// Looking for the catch block
code = code.replace(/if \([\s\S]*?err\?\.message\?\.includes\('fetch'\)[\s\S]*?setError\(err\.message \|\| 'Ocorreu um erro durante a autenticação\.'\);/m, replacement);

fs.writeFileSync('src/components/Login.tsx', code);
