const fs = require('fs');
let code = fs.readFileSync('src/components/TratamentosFormSection.tsx', 'utf8');

const regex = /\{activeMedicamentos\.map\(m => \(\s*<option key=\{m\} value=\{m\}>\{m\}<\/option>\s*\)\)\}/s;
const replacement = `{activeMedicamentos.map(m => {
                      const name = typeof m === 'string' ? m : m.nome;
                      return <option key={name} value={name}>{name}</option>;
                    })}`;
code = code.replace(regex, replacement);

const includesRegex = /!activeMedicamentos\.includes\(tratamento\.produto\)/s;
const includesReplacement = `!activeMedicamentos.some(m => (typeof m === 'string' ? m : m.nome) === tratamento.produto)`;
code = code.replace(includesRegex, includesReplacement);

fs.writeFileSync('src/components/TratamentosFormSection.tsx', code);
console.log('Fixed options in TratamentosFormSection');
