const fs = require('fs');
let code = fs.readFileSync('src/components/Tutorial.tsx', 'utf-8');

code = code.replace(
  "import Joyride, { Step, STATUS, EVENTS, ACTIONS, TooltipRenderProps } from 'react-joyride';",
  "import { Joyride, Step, STATUS, EVENTS, ACTIONS, TooltipRenderProps } from 'react-joyride';"
);

fs.writeFileSync('src/components/Tutorial.tsx', code);
console.log('Fixed import');
