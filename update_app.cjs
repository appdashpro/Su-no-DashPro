const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');

// Insert log at the very beginning of the file (after imports)
let newContent = content.replace('export default function App() {', 'console.log("[App] File loaded");\nexport default function App() {\n  console.log("[App] Component rendering...");\n');

// Find return statements and add a log just before them
newContent = newContent.replace(/if \(loading\) \{/g, 'console.log("[App] Rendering loading state");\n  if (loading) {');
newContent = newContent.replace(/if \(\!session\) \{/g, 'console.log("[App] Rendering login state");\n  if (!session) {');
newContent = newContent.replace(/return \(/g, 'console.log("[App] Returning main UI");\n  return (');

fs.writeFileSync('src/App.tsx', newContent);
console.log('App.tsx updated');
