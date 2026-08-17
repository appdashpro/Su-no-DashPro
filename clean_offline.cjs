const fs = require('fs');
let content = fs.readFileSync('src/lib/storage.ts', 'utf8');

content = content.replace("    safeStorage.setItem(VISITS_KEY, JSON.stringify(visits));\n    return visits;", "    return visits;");
fs.writeFileSync('src/lib/storage.ts', content);
console.log("Cleaned");
