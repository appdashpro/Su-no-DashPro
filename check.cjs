const fs = require('fs');
const code = fs.readFileSync('src/lib/storage.ts', 'utf8');
try {
  new Function(code);
} catch (e) {
  console.log(e);
}
