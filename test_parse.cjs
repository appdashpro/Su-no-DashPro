const ts = require('typescript');
const fs = require('fs');

const code = fs.readFileSync('src/components/EmpresaConfigGestao.tsx', 'utf8');
const sourceFile = ts.createSourceFile('test.tsx', code, ts.ScriptTarget.Latest, true);

function printErrors(node) {
  // typescript parser doesn't throw, it creates nodes with errors
}
// Actually, Babel is better.
