const fs = require('fs');
let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

const targetStr = `{userProfile.papel === 'MASTER' ? 'Master' : userProfile.papel === 'TECNICO_NUTRON' ? 'Téc. Nutron' : 'Téc. Cliente'}`;
const replacementStr = `{userProfile.papel === 'MASTER' ? 'Master' : userProfile.papel === 'TECNICO_NUTRON' ? 'Téc. Nutron' : \`Téc. \${userProfile.nome}\`}`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/Sidebar.tsx', content, 'utf8');
