const fs = require('fs');
let code = fs.readFileSync('src/components/Tutorial.tsx', 'utf-8');

// Remove stepIndex state
code = code.replace(/const \[stepIndex, setStepIndex\] = useState\(0\);\n/, "");

// Remove the reset effect we just added
code = code.replace(/useEffect\(\(\) => \{\n\s*if \(run\) \{\n\s*setStepIndex\(0\);\n\s*\}\n\s*\}, \[run\]\);\n/, "");

// Clean up callback
const oldCallback = /const handleJoyrideCallback = \(data: CallBackProps\) => \{[\s\S]*?onFinish\(\);\n\s*\}\n\s*\};/;
const newCallback = `const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
    if (finishedStatuses.includes(status) || action === 'close') {
      onFinish();
    }
  };`;
code = code.replace(oldCallback, newCallback);

// Remove stepIndex from <Joyride ... />
code = code.replace(/\s*stepIndex=\{stepIndex\}/, "");

fs.writeFileSync('src/components/Tutorial.tsx', code);
console.log('simplified Tutorial');
