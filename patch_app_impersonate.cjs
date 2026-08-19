const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add state
const stateTarget = "const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(() => getSavedUserProfile());";
content = content.replace(stateTarget, stateTarget + "\n  const [masterUserProfile, setMasterUserProfile] = useState<UserProfile | null>(null);");

// Update impersonate logic
const impTarget = `{currentTab === 'usuarios' && <UsuariosGestao integrados={integrados} currentUser={currentUserProfile} onImpersonate={(user) => {
  setCurrentUserProfile(user);
  setCurrentTab('dashboard');
}} />}`;
const impReplacement = `{currentTab === 'usuarios' && <UsuariosGestao integrados={integrados} currentUser={currentUserProfile} onImpersonate={(user) => {
  setMasterUserProfile(currentUserProfile);
  setCurrentUserProfile(user);
  setCurrentTab('dashboard');
}} />}`;
content = content.replace(impTarget, impReplacement);

// Add clear impersonation on logout
const logoutTarget = "setCurrentUserProfile(null);";
content = content.replace(logoutTarget, logoutTarget + "\n    setMasterUserProfile(null);");

// Add button to header
const headerTarget = "<Notifications visits={visits} integrados={integrados} />";
const headerReplacement = `{masterUserProfile && (
              <button 
                onClick={() => {
                  setCurrentUserProfile(masterUserProfile);
                  setMasterUserProfile(null);
                }}
                className="hidden sm:flex items-center gap-1.5 bg-amber-100 text-amber-800 text-[11px] font-bold px-3 py-1.5 rounded-full border border-amber-300 hover:bg-amber-200 transition-colors mr-2"
                title="Você está visualizando o sistema como outro usuário. Clique para retornar ao seu acesso."
              >
                <span>👑 Retornar ao Master</span>
              </button>
            )}
            <Notifications visits={visits} integrados={integrados} />`;
content = content.replace(headerTarget, headerReplacement);

fs.writeFileSync('src/App.tsx', content, 'utf8');
