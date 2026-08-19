const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const replacement = `  const getRoleBadge = () => {
    if (!currentUserProfile) return null;
    const role = currentUserProfile.papel;
    if (role === 'MASTER' || role === 'SUPER_ADMIN') {
      return <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-300 dark:border-purple-800 rounded-full uppercase tracking-wider" title="Acesso Master">👑 Acesso Master</span>;
    }
    if (role === 'TECNICO_NUTRON' || role === 'COORDENADOR') {
      return <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300 dark:border-blue-800 rounded-full uppercase tracking-wider" title="Técnico Nutron">🏢 Técnico Nutron</span>;
    }
    return <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-full uppercase tracking-wider" title={\`Técnico \${currentUserProfile.nome}\`}>🚜 Técnico {currentUserProfile.nome}</span>;
  };`;

content = content.replace(/ const getRoleBadge = \(\) => \{[\s\S]*?\🚜 Técnico Cliente<\/span>;\n \};\n/m, replacement + "\n");
fs.writeFileSync('src/App.tsx', content, 'utf8');
