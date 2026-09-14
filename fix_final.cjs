const fs = require('fs');
let code = fs.readFileSync('src/components/EmpresaConfigGestao.tsx', 'utf8');

// I am going to remove the duplicate `</div></div>` which caused the JSX to end prematurely.
// Wait! If the JSX ended prematurely at line 350, then the REST of the file is parsed as regular TypeScript!
// Let's check if the JSX ends at line 350!
