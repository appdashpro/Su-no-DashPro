const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('getCachedAuthSession,')) {
    code = code.replace(/filterVisitsForUser\n\} from '\.\/lib\/auth';/, "filterVisitsForUser,\n  getCachedAuthSession\n} from './lib/auth';");
    fs.writeFileSync('src/App.tsx', code);
}
