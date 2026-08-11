const fs = require('fs');
let code = fs.readFileSync('src/components/Tutorial.tsx', 'utf-8');

const newEffect = `useEffect(() => {
    if (run) {
      setStepIndex(0);
    }
  }, [run]);`;

code = code.replace(
  "const handleJoyrideCallback = (data: CallBackProps) => {",
  `${newEffect}\n\n  const handleJoyrideCallback = (data: CallBackProps) => {`
);

fs.writeFileSync('src/components/Tutorial.tsx', code);
console.log('patched Tutorial reset');
