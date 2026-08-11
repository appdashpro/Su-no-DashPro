const fs = require('fs');
let code = fs.readFileSync('src/components/Tutorial.tsx', 'utf-8');

// Replace callback with onEvent
code = code.replace(/callback=\{handleJoyrideCallback\}/g, "onEvent={handleJoyrideCallback}");

// Replace old props with options
const oldProps = /continuous[\s\S]*?spotlightClicks=\{false\}/m;

const newProps = `continuous
      run={run}
      stepIndex={stepIndex}
      scrollToFirstStep
      steps={steps}
      tooltipComponent={CustomTooltip}
      options={{
        overlayColor: 'rgba(15, 23, 42, 0.75)',
        zIndex: 10000,
        overlayClickAction: false,
        blockTargetInteraction: true
      }}`;

code = code.replace(oldProps, newProps);

// Also remove `styles={{ spotlight: {} }}` if present
code = code.replace(/styles=\{\{[\s\S]*?\}\}/g, "");

fs.writeFileSync('src/components/Tutorial.tsx', code);
console.log('Fixed Joyride props for v3');
