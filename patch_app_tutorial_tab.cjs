const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /<Tutorial run=\{true\} onFinish=\{\(\) => \{[\s\S]*?\}\} \/>/,
  `<Tutorial 
        run={true} 
        onChangeTab={setCurrentTab}
        onFinish={() => {
          setRunTutorial(false);
          localStorage.setItem('tutorial_completed', 'true');
        }} 
      />`
);

fs.writeFileSync('src/App.tsx', code);
console.log('patched App.tsx with onChangeTab');
