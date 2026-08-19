const fs = require('fs');
let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

const targetLogic = `{userProfile.papel === 'MASTER' ? 'Master' : userProfile.papel === 'TECNICO_NUTRON' ? 'Téc. Nutron' : \`Téc. \${userProfile.nome}\`}`;

const replacementLogic = `{userProfile.papel === 'MASTER' ? 'Master' : userProfile.papel === 'TECNICO_NUTRON' ? 'Téc. Nutron' : 'Cliente'}`;

content = content.replace(targetLogic, replacementLogic);
fs.writeFileSync('src/components/Sidebar.tsx', content, 'utf8');
