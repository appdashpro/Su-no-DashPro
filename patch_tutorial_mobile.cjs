const fs = require('fs');
let code = fs.readFileSync('src/components/Tutorial.tsx', 'utf-8');

// Add new props
code = code.replace(
  "onOpenVisitForm: () => void;",
  "onOpenVisitForm: () => void;\n  onOpenSidebar: () => void;\n  onCloseSidebar: () => void;"
);

code = code.replace(
  "export function Tutorial({ run, onFinish, onChangeTab, onOpenVisitForm }: TutorialProps) {",
  "export function Tutorial({ run, onFinish, onChangeTab, onOpenVisitForm, onOpenSidebar, onCloseSidebar }: TutorialProps) {"
);

// Update state handlers
const oldCallback = /if \(type === EVENTS\.STEP_AFTER \|\| type === EVENTS\.TARGET_NOT_FOUND\) \{[\s\S]*?setTimeout\(\(\) => \{/m;
const newCallback = `if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      let nextIndex = index + (action === ACTIONS.PREV ? -1 : 1);
      if (nextIndex < 0) nextIndex = 0;
      
      // Control application state before jumping to the step
      if (nextIndex === 0) { onChangeTab('dashboard'); onCloseSidebar(); }
      if (nextIndex === 1) { onChangeTab('dashboard'); onOpenSidebar(); }
      if (nextIndex === 2) { onChangeTab('dashboard'); onCloseSidebar(); }
      if (nextIndex === 3) { onChangeTab('visitas'); onOpenSidebar(); }
      if (nextIndex === 4) { onChangeTab('visitas'); onCloseSidebar(); }
      if (nextIndex === 5) {
        onChangeTab('visitas');
        onCloseSidebar();
        onOpenVisitForm();
      }
      if (nextIndex === 6) {
        onChangeTab('visitas');
        onCloseSidebar();
        onOpenVisitForm();
      }
      if (nextIndex === 7) {
        onChangeTab('dashboard');
        onCloseSidebar();
      }
      
      setTimeout(() => {`;
      
code = code.replace(oldCallback, newCallback);

// Change the setTimeout delay from 50 to 350 to allow transitions
code = code.replace(/setTimeout\(\(\) => \{\n\s*setStepIndex\(nextIndex\);\n\s*\}, 50\);/, "setTimeout(() => {\n        setStepIndex(nextIndex);\n      }, 350);");

fs.writeFileSync('src/components/Tutorial.tsx', code);
console.log('patched Tutorial.tsx for mobile');
