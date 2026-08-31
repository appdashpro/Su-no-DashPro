const fs = require('fs');
let content = fs.readFileSync('src/components/Visits.tsx', 'utf8');

// I will just add </AnimatePresence> before {showDiagnostic && (
content = content.replace('{showDiagnostic && (', '</AnimatePresence>\n{showDiagnostic && (');

fs.writeFileSync('src/components/Visits.tsx', content);
