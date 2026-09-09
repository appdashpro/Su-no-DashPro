const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf8');

const regex = /try \{\s*\/\/\ 1\. If offline, check if we have cached profile or offline fallback\s*if \(\s*err\?\.message\?\.includes\('fetch'\) \|\|/g;

const targetLogic = `    try {
      // 1. If offline, check if we have cached profile or offline fallback
            
      if (
        err?.message?.includes('fetch') ||`;

const replaceLogic = `    try {
      // 1. Simulate authentication
      const profile = await resolveUserProfile(normEmail, 'offline_field');
      saveUserProfile(profile);
      cacheAuthSession({ user: { id: profile.id, email: profile.email } });
      if (onLoginSuccess) onLoginSuccess(profile);
    } catch (err: any) {
      if (
        err?.message?.includes('fetch') ||`;

code = code.replace(targetLogic, replaceLogic);
fs.writeFileSync('src/components/Login.tsx', code);
