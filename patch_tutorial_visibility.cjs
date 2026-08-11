const fs = require('fs');
let code = fs.readFileSync('src/components/Tutorial.tsx', 'utf-8');

// Replace the handleJoyrideCallback logic
const oldLogic = /if \(type === EVENTS\.STEP_AFTER \|\| type === EVENTS\.TARGET_NOT_FOUND\) \{[\s\S]*?setTimeout\(\(\) => \{\n\s*setStepIndex\(nextIndex\);\n\s*\}, 350\);\n\s*\}/m;

const newLogic = `if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      let nextIndex = index + (action === ACTIONS.PREV ? -1 : 1);
      if (nextIndex < 0) nextIndex = 0;
      if (nextIndex >= steps.length) nextIndex = steps.length - 1;
      
      // Control application state before jumping to the step
      if (nextIndex === 0) { onChangeTab('dashboard'); onCloseSidebar(); onCloseVisitForm(); }
      if (nextIndex === 1) { onChangeTab('dashboard'); onCloseSidebar(); onCloseVisitForm(); }
      if (nextIndex === 2) { onChangeTab('dashboard'); onCloseSidebar(); onCloseVisitForm(); }
      if (nextIndex === 3) { onChangeTab('visitas'); onCloseSidebar(); onCloseVisitForm(); }
      if (nextIndex === 4) { onChangeTab('visitas'); onCloseSidebar(); onOpenVisitForm(); }
      if (nextIndex === 5) { onChangeTab('visitas'); onCloseSidebar(); onOpenVisitForm(); }
      if (nextIndex === 6) { onChangeTab('dashboard'); onCloseSidebar(); onCloseVisitForm(); }
      
      const checkVisibility = (attempts = 0) => {
        let refItem: HTMLElement | null = null;
        if (nextIndex === 1) refItem = tutorialRefs.headerTitle.current;
        if (nextIndex === 2) refItem = tutorialRefs.kpiAlertas.current;
        if (nextIndex === 3) refItem = tutorialRefs.btnNovoLancamento.current;
        if (nextIndex === 4) refItem = tutorialRefs.formIntegradoNome.current;
        if (nextIndex === 5) refItem = tutorialRefs.formSalvar.current;

        const needsRef = [1, 2, 3, 4, 5].includes(nextIndex);
        
        // Check if element exists and is visible
        const isVisible = refItem && typeof refItem.getBoundingClientRect === 'function' && refItem.getBoundingClientRect().width > 0;

        if (needsRef && !isVisible && attempts < 20) {
          setTimeout(() => checkVisibility(attempts + 1), 100);
          return;
        }
        
        setStepIndex(nextIndex);
      };
      
      // Start checking after a short delay to allow React to begin rendering
      setTimeout(() => checkVisibility(0), 100);
    }`;

code = code.replace(oldLogic, newLogic);

fs.writeFileSync('src/components/Tutorial.tsx', code);
console.log('patched Tutorial visibility check');
