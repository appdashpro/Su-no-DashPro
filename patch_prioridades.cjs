const fs = require('fs');
let code = fs.readFileSync('src/components/Prioridades.tsx', 'utf8');

if (!code.includes('getEmpresaConfigsLocal')) {
  code = code.replace(
    "import { Integrado, Visit } from '../types';", 
    "import { Integrado, Visit } from '../types';\nimport { getEmpresaConfigsLocal } from '../lib/storage';"
  );
}

// Now replace the mortality and feed deviation hardcoded logic.
// We need to inject `const configs = getEmpresaConfigsLocal();` into the Prioridades component.
code = code.replace(
  "const activeIntegrados = integrados.filter(i => i.status === 'Em andamento');",
  "const activeIntegrados = integrados.filter(i => i.status === 'Em andamento');\n  const configs = getEmpresaConfigsLocal();"
);

// We need to pass propMeta for each item, or calculate it inline.
// Inside the prioridades.map loop:
/*
                prioridades.map((item, index) => {
                  const safeAge = isNaN(item.age) ? 0 : item.age;
                  const configRow = configs.find(c => c.empresa_id === item.integrado.empresaId);
                  const finalMeta = configRow?.meta_mortalidade !== undefined && configRow?.meta_mortalidade !== null ? configRow.meta_mortalidade : 3;
                  const propMeta = safeAge ? Number(((Math.min(safeAge, 105) / 105) * finalMeta).toFixed(2)) : finalMeta;
                  const isMortalityOut = item.mortality > propMeta;
*/

// Let's modify the map block.
const targetMap = `prioridades.map((item, index) => {
                  const safeAge = isNaN(item.age) ? 0 : item.age;
                  const progressPct = Math.min(100, Math.round((safeAge / 105) * 100) || 0);`;

const replaceMap = `prioridades.map((item, index) => {
                  const safeAge = isNaN(item.age) ? 0 : item.age;
                  const progressPct = Math.min(100, Math.round((safeAge / 105) * 100) || 0);
                  
                  const configRow = configs.find(c => c.empresa_id === item.integrado.empresaId);
                  const finalMeta = configRow?.meta_mortalidade !== undefined && configRow?.meta_mortalidade !== null ? configRow.meta_mortalidade : 3;
                  const propMeta = safeAge ? Number(((Math.min(safeAge, 105) / 105) * finalMeta).toFixed(2)) : finalMeta;
                  
                  const isMortalityOut = item.mortality > propMeta;
                  const isMortalityGood = item.mortality <= propMeta;
                  
                  // Feed deviation: Let's consider < -2 or > 5 as bad, or we can use the same logic as Dashboard (+/- 5). 
                  // But usually +/- bounds are configured or standard. Let's use < -2 (danger) and > 5 (waste) or just > 2.
                  // Dashboard uses > 5 as Red.
                  const isFeedOut = item.feedDeviation !== null && (item.feedDeviation < -2 || item.feedDeviation > 5);
                  const isFeedGood = item.feedDeviation !== null && (item.feedDeviation >= -2 && item.feedDeviation <= 2);
`;

code = code.replace(targetMap, replaceMap);

// Now update the render of mortality:
/*
<Activity className={\`h-3.5 w-3.5 \${item.mortality >= 2.5 ? 'text-red-500' : 'text-slate-400'}\`} />
                              <span className={item.mortality >= 2.5 ? 'text-red-700 font-bold' : 'text-slate-600 font-medium'}>
                                {item.mortality.toFixed(2)}%
                              </span>
*/

const targetMortality = `<Activity className={\`h-3.5 w-3.5 \${item.mortality >= 2.5 ? 'text-red-500' : 'text-slate-400'}\`} />
                              <span className={item.mortality >= 2.5 ? 'text-red-700 font-bold' : 'text-slate-600 font-medium'}>
                                {item.mortality.toFixed(2)}%
                              </span>`;

const replaceMortality = `<Activity className={\`h-3.5 w-3.5 \${isMortalityOut ? 'text-red-500' : isMortalityGood ? 'text-emerald-500' : 'text-slate-400'}\`} />
                              <span className={isMortalityOut ? 'text-red-700 font-bold' : isMortalityGood ? 'text-emerald-700 font-medium' : 'text-slate-600 font-medium'}>
                                {item.mortality.toFixed(2)}%
                              </span>`;

code = code.replace(targetMortality, replaceMortality);

// Update feedDeviation:
/*
<TrendingDown className={\`h-3.5 w-3.5 \${item.feedDeviation !== null && item.feedDeviation < -2 ? 'text-red-500' : 'text-slate-400'}\`} />
                              <span className={item.feedDeviation !== null && item.feedDeviation < -2 ? 'text-red-700 font-bold' : 'text-slate-600 font-medium'}>
                                {item.feedDeviation !== null ? \`\${item.feedDeviation > 0 ? '+' : ''}\${item.feedDeviation.toFixed(2)}kg\` : 'N/A'}
                              </span>
*/

const targetFeed = `<TrendingDown className={\`h-3.5 w-3.5 \${item.feedDeviation !== null && item.feedDeviation < -2 ? 'text-red-500' : 'text-slate-400'}\`} />
                              <span className={item.feedDeviation !== null && item.feedDeviation < -2 ? 'text-red-700 font-bold' : 'text-slate-600 font-medium'}>
                                {item.feedDeviation !== null ? \`\${item.feedDeviation > 0 ? '+' : ''}\${item.feedDeviation.toFixed(2)}kg\` : 'N/A'}
                              </span>`;

const replaceFeed = `<TrendingDown className={\`h-3.5 w-3.5 \${isFeedOut ? 'text-red-500' : isFeedGood ? 'text-emerald-500' : 'text-slate-400'}\`} />
                              <span className={isFeedOut ? 'text-red-700 font-bold' : isFeedGood ? 'text-emerald-700 font-medium' : 'text-slate-600 font-medium'}>
                                {item.feedDeviation !== null ? \`\${item.feedDeviation > 0 ? '+' : ''}\${item.feedDeviation.toFixed(2)}kg\` : 'N/A'}
                              </span>`;

code = code.replace(targetFeed, replaceFeed);

fs.writeFileSync('src/components/Prioridades.tsx', code);
