const fs = require('fs');
let content = fs.readFileSync('src/components/Visits.tsx', 'utf8');
content = content.replace('const [showDiagnostic, setShowDiagnostic] = useState(false);', '');

const startStr = '{showDiagnostic && (';
const startIdx = content.indexOf(startStr);
if (startIdx !== -1) {
    const endStr = ')}</div>);}';
    const endIdx = content.lastIndexOf(endStr);
    if (endIdx !== -1) {
        content = content.substring(0, startIdx) + '</div>);}';
        fs.writeFileSync('src/components/Visits.tsx', content);
        console.log("Removed diagnostic block");
    }
}
