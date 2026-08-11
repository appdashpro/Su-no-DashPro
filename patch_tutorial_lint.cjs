const fs = require('fs');
let code = fs.readFileSync('src/components/Tutorial.tsx', 'utf-8');

// Fix CallBackProps import
code = code.replace(
  "import { Joyride, CallBackProps, STATUS, Step, EVENTS, ACTIONS, TooltipRenderProps } from 'react-joyride';",
  "import { Joyride, STATUS, Step, EVENTS, ACTIONS, TooltipRenderProps } from 'react-joyride';"
);
code = code.replace(
  "const handleJoyrideCallback = (data: CallBackProps) => {",
  "const handleJoyrideCallback = (data: any) => {"
);

// Remove disableBeacon
code = code.replace(/\s*disableBeacon: true,/g, "");

// Remove borderRadius from spotlight styles
code = code.replace(
  /spotlight: \{\s*borderRadius: '12px'\s*\}/g,
  "spotlight: {}"
);

fs.writeFileSync('src/components/Tutorial.tsx', code);
console.log('patched Tutorial.tsx');
