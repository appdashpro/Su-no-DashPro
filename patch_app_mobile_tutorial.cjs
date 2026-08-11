const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  "onOpenVisitForm={() => { setIsVisitFormOpen(true); setIsNewLoteMode(false); }}",
  "onOpenVisitForm={() => { setIsVisitFormOpen(true); setIsNewLoteMode(false); }}\n        onOpenSidebar={() => setIsSidebarOpen(true)}\n        onCloseSidebar={() => setIsSidebarOpen(false)}"
);

fs.writeFileSync('src/App.tsx', code);
console.log('patched App.tsx with mobile tutorial props');
