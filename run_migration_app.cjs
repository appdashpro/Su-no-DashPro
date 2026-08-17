const fs = require('fs');

let appCode = fs.readFileSync('src/App.tsx', 'utf8');
if (!appCode.includes("storage.migrateIds()")) {
    appCode = appCode.replace("const loadData = async () => {", "const loadData = async () => {\n storage.migrateIds();\n");
    fs.writeFileSync('src/App.tsx', appCode);
    console.log("Added to loadData");
}
