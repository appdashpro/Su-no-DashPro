const fs = require('fs');
let code = fs.readFileSync('src/lib/whatsapp.ts', 'utf8');

// Include getExpectedConsumption
code = code.replace("import { getActiveCurve } from '../data';", "import { getActiveCurve, getExpectedConsumption } from '../data';");

// Re-calculate the meta
const metaRegex = /const \{ metas \} \= getActiveCurve[\s\S]*?const metaAcumuladaNum \= metaAcumuladaStr \? Number\(metaAcumuladaStr\) : 0;/;
const metaReplace = `const { metas } = getActiveCurve(integrado?.alojamentoDate, integrado?.status, visit.tipoLote || 'Misto', integrado?.fechamentoDate, currentConfig, visit.curva_consumo_id, visit.date);
  
  // A meta de consumo na visita geralmente reflete o esperado para a IDADE do lote
  const metaConsumoEsperado = getExpectedConsumption(visit.idade || 0, visit.tipoLote, visit.pesoAloj, integrado?.alojamentoDate, integrado?.status, integrado?.fechamentoDate, currentConfig, visit.curva_consumo_id, visit.date);
  const metaAcumuladaNum = metaConsumoEsperado > 0 ? metaConsumoEsperado : (visit.metaAcumulada ? Number(visit.metaAcumulada) : metas.metaAcumulada || 0);
  `;
code = code.replace(metaRegex, metaReplace);

fs.writeFileSync('src/lib/whatsapp.ts', code);
