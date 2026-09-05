const fs = require('fs');
let configCode = fs.readFileSync('src/components/EmpresaConfigGestao.tsx', 'utf8');

configCode = configCode.replace(/const \[activeTab, setActiveTab\] = useState<.*?><'geral' \| 'catalogo'>\('geral'\);/, "");
// If the regex failed, do a string replace
configCode = configCode.replace("const [activeTab, setActiveTab] = useState<'geral' | 'catalogo'>('geral');", "");

fs.writeFileSync('src/components/EmpresaConfigGestao.tsx', configCode);
console.log('Removed activeTab');
