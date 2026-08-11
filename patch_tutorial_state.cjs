const fs = require('fs');
let code = fs.readFileSync('src/components/Tutorial.tsx', 'utf-8');

code = code.replace(
  "export function Tutorial({ run, onFinish }: TutorialProps) {",
  "export function Tutorial({ run, onFinish }: TutorialProps) {\n  const [stepIndex, setStepIndex] = useState(0);"
);

code = code.replace(
  "const handleJoyrideCallback = (data: CallBackProps) => {",
  `const handleJoyrideCallback = (data: CallBackProps) => {
    const { action, index, status, type } = data;
    if (type === 'step:after' || type === 'target:notFound') {
      setStepIndex(index + (action === 'prev' ? -1 : 1));
    }`
);

code = code.replace(
  "if (finishedStatuses.includes(status)) {\n      onFinish();\n    }",
  "if (finishedStatuses.includes(status)) {\n      setStepIndex(0);\n      onFinish();\n    }"
);

code = code.replace(
  "run={run}",
  "run={run}\n      stepIndex={stepIndex}"
);

fs.writeFileSync('src/components/Tutorial.tsx', code);
console.log('patched Tutorial state');
