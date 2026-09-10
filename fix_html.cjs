const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

code = code.replace('<html lang="en">', '<html lang="pt-BR" translate="no">');
code = code.replace('<head>', '<head>\n    <meta name="google" content="notranslate" />');

fs.writeFileSync('index.html', code);
