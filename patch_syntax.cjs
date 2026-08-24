const fs = require('fs');
let code = fs.readFileSync('src/lib/storage.ts', 'utf8');

const targetStr = `
         if (errTratamentos) {
             console.error("Erro insert tratamentos:", errTratamentos);
             addVisitsToOfflineQueue([v]);
             continue;
         }
       }
    }
    return visits;
`;

// Let's just do a regex replace to catch any spacing issues
code = code.replace(/(\s*if\s*\(errTratamentos\)\s*\{\s*console\.error\("Erro insert tratamentos:", errTratamentos\);\s*addVisitsToOfflineQueue\(\[v\]\);\s*continue;\s*\}\s*\})([\s\S]*?)(\s*\}\s*return visits;)/, 
  "$1\n      } catch (loopErr) {\n         console.error('Exception processing visit in saveVisits:', loopErr);\n         addVisitsToOfflineQueue([v]);\n      }\n    }\n    return visits;"
);

fs.writeFileSync('src/lib/storage.ts', code);
