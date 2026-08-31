const fs = require('fs');

let lines = fs.readFileSync('src/components/Visits.tsx', 'utf8').split('\n');

const startIdx = lines.findIndex(l => l.includes('{showDiagnostic && ('));
const endIdx = lines.findIndex((l, i) => i > startIdx && l.includes(')}'));

if (startIdx !== -1 && endIdx !== -1) {
    const block = lines.slice(startIdx, endIdx + 1);
    
    // Remove the block from the original location
    lines.splice(startIdx, endIdx - startIdx + 1);
    
    // Find where to put it back (just before the final </div> );)
    const insertIdx = lines.length - 2; // last line is }, line before is ); so maybe let's search
    
    let targetIdx = lines.length - 1;
    while(targetIdx > 0) {
       if (lines[targetIdx].includes('</div>')) {
           break;
       }
       targetIdx--;
    }
    
    lines.splice(targetIdx - 1, 0, ...block);
    
    fs.writeFileSync('src/components/Visits.tsx', lines.join('\n'), 'utf8');
    console.log("Successfully moved block");
} else {
    console.log("Could not find start/end", startIdx, endIdx);
}

