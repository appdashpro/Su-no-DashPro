const fs = require('fs');
let lines = fs.readFileSync('src/components/Visits.tsx', 'utf8').split('\n');

const tbodyIdx = lines.findIndex(l => l.includes('<tbody className="divide-y divide-slate-100">'));
if (tbodyIdx !== -1) {
    let removeEndIdx = tbodyIdx + 1;
    let foundAnimatePresence = false;
    
    // We want to remove until the line right before <AnimatePresence>
    for (let i = tbodyIdx + 1; i < lines.length; i++) {
        if (lines[i].includes('<AnimatePresence>')) {
            removeEndIdx = i - 1; // wait, the line before is `)}`
            foundAnimatePresence = true;
            break;
        }
    }
    
    if (foundAnimatePresence) {
        lines.splice(tbodyIdx + 1, removeEndIdx - tbodyIdx);
        fs.writeFileSync('src/components/Visits.tsx', lines.join('\n'));
        console.log("Deleted broken remainder inside tbody!");
    } else {
        console.log("Could not find AnimatePresence after tbody");
    }
} else {
    console.log("Could not find tbody");
}
