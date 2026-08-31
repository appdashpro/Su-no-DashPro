const fs = require('fs');
let lines = fs.readFileSync('src/components/Visits.tsx', 'utf8').split('\n');

const startIdx = lines.findIndex(l => l.includes('{showDiagnostic && ('));
if (startIdx !== -1) {
    lines.splice(startIdx);
    lines.push('</div>', '  );', '}');
    fs.writeFileSync('src/components/Visits.tsx', lines.join('\n'));
    console.log("Removed diagnostic block");
}
