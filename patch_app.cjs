const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "import { saveBackupToIndexedDB } from './lib/backup';",
  "import { saveBackupToIndexedDB, restoreBackupFromIndexedDB } from './lib/backup';"
);

code = code.replace(
  "const loadData = useCallback(async () => {",
  "const loadData = useCallback(async () => {\n await restoreBackupFromIndexedDB();"
);

fs.writeFileSync('src/App.tsx', code);
