const fs = require('fs');

function fixFile(file) {
  let code = fs.readFileSync(file, 'utf-8');
  code = code.replace(/ref=\{\(el\) => tutorialRefs\.([^.]+)\.current = el\}/g, 'ref={(el) => { tutorialRefs.$1.current = el; }}');
  fs.writeFileSync(file, code);
}

fixFile('src/App.tsx');
fixFile('src/components/Dashboard.tsx');
fixFile('src/components/Visits.tsx');
fixFile('src/components/VisitForm.tsx');
console.log('Fixed refs lint');
