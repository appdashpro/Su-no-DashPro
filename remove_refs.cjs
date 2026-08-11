const fs = require('fs');

function removeRef(file, refName) {
  let code = fs.readFileSync(file, 'utf-8');
  
  // Remove import
  code = code.replace(/import \{ tutorialRefs \} from '[^']+';\n?/g, '');
  
  // Remove ref assignments
  const refRegex = new RegExp(`ref=\\{\\(el\\) => \\{ tutorialRefs\\.${refName}\\.current = el; \\}\\}`, 'g');
  code = code.replace(refRegex, '');
  
  // Clean up any double spaces that might result
  code = code.replace(/  +/g, ' ');
  
  fs.writeFileSync(file, code);
}

removeRef('src/App.tsx', 'headerTitle');
removeRef('src/components/Dashboard.tsx', 'kpiAlertas');
removeRef('src/components/Visits.tsx', 'btnNovoLancamento');
removeRef('src/components/VisitForm.tsx', 'formIntegradoNome');
removeRef('src/components/VisitForm.tsx', 'formSalvar');

// Remove the lib file
if (fs.existsSync('src/lib/tutorialRefs.ts')) {
  fs.unlinkSync('src/lib/tutorialRefs.ts');
}

console.log('Removed refs');
