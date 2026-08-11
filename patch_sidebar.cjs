const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf-8');

code = code.replace(
  `key={item.id}`,
  `key={item.id} id={\`sidebar-item-\${item.id}\`}`
);

fs.writeFileSync('src/components/Sidebar.tsx', code);
console.log('patched sidebar');
