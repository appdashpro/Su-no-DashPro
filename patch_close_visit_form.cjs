const fs = require('fs');
let tutorialCode = fs.readFileSync('src/components/Tutorial.tsx', 'utf-8');

tutorialCode = tutorialCode.replace(
  "onOpenSidebar: () => void;",
  "onOpenSidebar: () => void;\n  onCloseVisitForm: () => void;"
);

tutorialCode = tutorialCode.replace(
  "onOpenSidebar, onCloseSidebar }: TutorialProps) {",
  "onOpenSidebar, onCloseSidebar, onCloseVisitForm }: TutorialProps) {"
);

tutorialCode = tutorialCode.replace(
  "if (nextIndex === 3) { onChangeTab('visitas'); onOpenSidebar(); }",
  "if (nextIndex === 3) { onChangeTab('visitas'); onOpenSidebar(); onCloseVisitForm(); }"
);
tutorialCode = tutorialCode.replace(
  "if (nextIndex === 4) { onChangeTab('visitas'); onCloseSidebar(); }",
  "if (nextIndex === 4) { onChangeTab('visitas'); onCloseSidebar(); onCloseVisitForm(); }"
);

fs.writeFileSync('src/components/Tutorial.tsx', tutorialCode);

let appCode = fs.readFileSync('src/App.tsx', 'utf-8');
appCode = appCode.replace(
  "onOpenVisitForm={() => { setIsVisitFormOpen(true); setIsNewLoteMode(false); }}",
  "onOpenVisitForm={() => { setIsVisitFormOpen(true); setIsNewLoteMode(false); }}\n        onCloseVisitForm={() => setIsVisitFormOpen(false)}"
);

fs.writeFileSync('src/App.tsx', appCode);
console.log('patched onCloseVisitForm');
