import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');
if (!code.includes("<MedicationAnalysis")) {
  code = code.replace(
    "import { Notifications } from './components/Notifications';",
    "import { Notifications } from './components/Notifications';\nimport { MedicationAnalysis } from './components/MedicationAnalysis';"
  );
  
  // Add the tab
  code = code.replace(
    "{currentTab === 'curva' && <ReferenceCurve />}",
    "{currentTab === 'medicamentos' && <MedicationAnalysis visits={visits} integrados={integrados} />}\n          {currentTab === 'curva' && <ReferenceCurve />}"
  );
  
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched App.tsx");
} else {
  console.log("Already patched");
}
