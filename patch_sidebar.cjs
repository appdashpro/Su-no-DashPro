const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

code = code.replace(
  "import { LayoutDashboard, Users, ClipboardList, Database, LogOut, Download, AlertCircle, Settings, ShieldCheck, HelpCircle } from 'lucide-react';",
  "import { LayoutDashboard, Users, ClipboardList, Database, LogOut, Download, AlertCircle, Settings, ShieldCheck, HelpCircle, DollarSign } from 'lucide-react';"
);

// find where items are defined
code = code.replace(
  "{ id: 'importar', label: 'Importar / Exportar', icon: Database, show: isMaster },",
  "{ id: 'faturamento', label: 'Faturamento', icon: DollarSign, show: isMaster || isCoordenador || currentUser?.papel === 'ADMIN_EMPRESA' },\n    { id: 'importar', label: 'Importar / Exportar', icon: Database, show: isMaster },"
);

fs.writeFileSync('src/components/Sidebar.tsx', code);
