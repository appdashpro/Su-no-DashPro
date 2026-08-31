import fs from 'fs';

const filePath = 'src/reports/templates/ConsolidatedLotesReport.ts';
let content = fs.readFileSync(filePath, 'utf-8');

// First, remove the old mortColor logic
content = content.replace(/const mortColor = mortPercentNum > 3\.0 \? '#ef4444' : '#334155'; \/\/ Red if > 3%/, '');

// Then find where targetAge is defined and insert new logic
const insertPointRegex = /const consumoEsperado = targetAge > 0/;

const newLogic = `
      const finalMetaMortalidade = currentConfig?.meta_mortalidade !== undefined && currentConfig?.meta_mortalidade !== null ? currentConfig.meta_mortalidade : 3;
      const propMetaMortalidade = targetAge ? Number(((Math.min(targetAge, 105) / 105) * finalMetaMortalidade).toFixed(2)) : finalMetaMortalidade;
      const isMortAlerta = mortPercentNum > propMetaMortalidade;
      const mortColor = isMortAlerta ? '#ef4444' : '#10b981';

      const consumoEsperado = targetAge > 0`;

content = content.replace(insertPointRegex, newLogic);

// Now for consMetaColor and accuracyColor
const errorRateRegex = /const errorRate =.*?null;/;
const consMetaLogic = `const errorRate = (consumoRealCab !== undefined && consumoEsperado && consumoEsperado > 0) ? Math.abs(consumoRealCab - consumoEsperado) / consumoEsperado : null;
      
      let consMetaColor = '#334155';
      let consMetaBold = false;
      if (consumoRealCab !== undefined && consumoEsperado !== null) {
        const realDiff = consumoRealCab - consumoEsperado;
        if (Math.abs(realDiff) <= 5) {
          consMetaColor = '#3b82f6'; // Blue
        } else if (realDiff < -5) {
          consMetaColor = '#10b981'; // Green
          consMetaBold = true;
        } else {
          consMetaColor = '#ef4444'; // Red
          consMetaBold = true;
        }
      }`;

content = content.replace(errorRateRegex, consMetaLogic);

// Update tableBody.push arguments
content = content.replace(/bold: mortPercentNum > 3\.0/g, 'bold: isMortAlerta');
content = content.replace(/\{ text: \(consumoRealCab !== undefined && consumoEsperado !== null\).*?fillColor \},/g, 
  `{ text: (consumoRealCab !== undefined && consumoEsperado !== null) ? \`\${consumoRealCab.toFixed(1)} / \${consumoEsperado.toFixed(1)}\` : '-', style: 'tableCell', fontSize: 8, alignment: 'center', color: consMetaColor, bold: consMetaBold, fillColor },`);

fs.writeFileSync(filePath, content);
