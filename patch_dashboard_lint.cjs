const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

code = code.replace(
  /const canvas = await html2canvas\(dashboardRef\.current, \{/g,
  'const canvas = await html2canvas(dashboardRef.current as HTMLElement, {'
);

fs.writeFileSync('src/components/Dashboard.tsx', code);
console.log('patched Dashboard.tsx');
