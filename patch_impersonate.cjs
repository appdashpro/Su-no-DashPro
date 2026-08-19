const fs = require('fs');
let content = fs.readFileSync('src/components/UsuariosGestao.tsx', 'utf8');

content = content.replace("currentUser: UserProfile | null;", "currentUser: UserProfile | null;\n  onImpersonate?: (user: UserProfile) => void;");

content = content.replace(
  "export function UsuariosGestao({ integrados, currentUser }: UsuariosGestaoProps) {",
  "export function UsuariosGestao({ integrados, currentUser, onImpersonate }: UsuariosGestaoProps) {"
);

// Add the impersonate logic to the badges
const isMasterStr = `isMaster && (`;
const isNutronStr = `isNutron && (`;
const isClientStr = `isClient && (`;

content = content.replace(/\{isMaster && \(\s*<span className="inline-flex items-center gap-1 px-2\.5 py-1 text-\[11px\] font-bold bg-purple-100 text-purple-800 rounded-full border border-purple-200">\s*👑 Acesso Master\s*<\/span>\s*\)\}/g, `{isMaster && (
                          <button 
                            type="button"
                            onClick={() => { if (currentUser?.papel === 'MASTER' && onImpersonate) onImpersonate(user); }}
                            className={\`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-purple-100 text-purple-800 rounded-full border border-purple-200 \${currentUser?.papel === 'MASTER' ? 'cursor-pointer hover:bg-purple-200 transition-colors' : ''}\`}
                            title={currentUser?.papel === 'MASTER' ? "Entrar como este usuário" : ""}
                          >
                            👑 Acesso Master
                          </button>
                        )}`);

content = content.replace(/\{isNutron && \(\s*<span className="inline-flex items-center gap-1 px-2\.5 py-1 text-\[11px\] font-bold bg-blue-100 text-blue-800 rounded-full border border-blue-200">\s*🏢 Técnico Nutron\s*<\/span>\s*\)\}/g, `{isNutron && (
                          <button 
                            type="button"
                            onClick={() => { if (currentUser?.papel === 'MASTER' && onImpersonate) onImpersonate(user); }}
                            className={\`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-blue-100 text-blue-800 rounded-full border border-blue-200 \${currentUser?.papel === 'MASTER' ? 'cursor-pointer hover:bg-blue-200 transition-colors' : ''}\`}
                            title={currentUser?.papel === 'MASTER' ? "Entrar como este usuário" : ""}
                          >
                            🏢 Técnico Nutron
                          </button>
                        )}`);

content = content.replace(/\{isClient && \(\s*<span className="inline-flex items-center gap-1 px-2\.5 py-1 text-\[11px\] font-bold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">\s*🚜 Técnico Cliente\s*<\/span>\s*\)\}/g, `{isClient && (
                          <button 
                            type="button"
                            onClick={() => { if (currentUser?.papel === 'MASTER' && onImpersonate) onImpersonate(user); }}
                            className={\`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200 \${currentUser?.papel === 'MASTER' ? 'cursor-pointer hover:bg-emerald-200 transition-colors' : ''}\`}
                            title={currentUser?.papel === 'MASTER' ? "Entrar como este usuário" : ""}
                          >
                            🚜 Técnico Cliente
                          </button>
                        )}`);

fs.writeFileSync('src/components/UsuariosGestao.tsx', content, 'utf8');
