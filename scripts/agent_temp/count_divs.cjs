const fs = require('fs');
let code = fs.readFileSync('src/components/IntegradoDetailsModal.tsx', 'utf8');

// remove comments and strings for accurate counting (rough)
let stripped = code.replace(/<div/g, 'OPENDIV').replace(/<\/div/g, 'CLOSEDIV');
let openCount = (stripped.match(/OPENDIV/g) || []).length;
let closeCount = (stripped.match(/CLOSEDIV/g) || []).length;
console.log(`Open: ${openCount}, Close: ${closeCount}`);
