const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = "{currentTab === 'usuarios' && <UsuariosGestao integrados={integrados} currentUser={currentUserProfile} />}";
const replacement = `{currentTab === 'usuarios' && <UsuariosGestao integrados={integrados} currentUser={currentUserProfile} onImpersonate={(user) => {
  setCurrentUserProfile(user);
  setCurrentTab('dashboard');
}} />}`;

content = content.replace(target, replacement);

fs.writeFileSync('src/App.tsx', content, 'utf8');
