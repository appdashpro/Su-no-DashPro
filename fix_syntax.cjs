const ts = require('typescript');
const fs = require('fs');

const code = fs.readFileSync('src/components/EmpresaConfigGestao.tsx', 'utf8');
// Let's find the unclosed JSX tag by just counting manually in a simple way
let divs = 0;
// We can just dump lines with <div> and </div>
