const fs = require('fs');

// 1. Remove from EmpresaConfigGestao
let configCode = fs.readFileSync('src/components/EmpresaConfigGestao.tsx', 'utf8');

configCode = configCode.replace("import { CatalogoGestao } from './CatalogoGestao';", "");
configCode = configCode.replace(/const \[activeTab, setActiveTab\] = useState<.*?><'geral' \| 'catalogo'>\('geral'\);/, "");

// Clean the tabs HTML completely, since 'geral' is the only tab now
const tabsRegex = /<div className="flex border-b border-slate-200">.*?<\/div>/s;
if (tabsRegex.test(configCode)) {
  configCode = configCode.replace(tabsRegex, "");
}

// Remove {activeTab === 'geral' && (<> and </>)}
configCode = configCode.replace(/\{activeTab === 'geral' && \(<>/g, "");
configCode = configCode.replace(/<\/>\)\}/g, "");
configCode = configCode.replace(/\{activeTab === 'catalogo'.*?\}/g, "");

fs.writeFileSync('src/components/EmpresaConfigGestao.tsx', configCode);

console.log('Removed from EmpresaConfigGestao');
