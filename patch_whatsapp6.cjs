const fs = require('fs');
let code = fs.readFileSync('src/lib/whatsapp.ts', 'utf8');

const regex = /if \(suinos\.tosse\) message \+= \`- Tosse: \$\{getStatusText\(suinos\.tosse\)\}\\n\`;\n      if \(suinos\.diarreia\) message \+= \`- Diarreia: \$\{getStatusText\(suinos\.diarreia\)\}\\n\`;/m;

const replacement = `if (suinos.tosse) message += \`- Tosse: \${getStatusText(suinos.tosse)}\\n\`;
      if (suinos.diarreia) message += \`- Diarreia: \${getStatusText(suinos.diarreia)}\\n\`;
      if (suinos.uniformidade) message += \`- Uniformidade: \${getStatusText(suinos.uniformidade)}\\n\`;
      if (suinos.canibalismo) message += \`- Canibalismo: \${getStatusText(suinos.canibalismo)}\\n\`;`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/lib/whatsapp.ts', code);
