const fs = require('fs');
let code = fs.readFileSync('src/lib/storage.ts', 'utf8');

const target = `    // Ensure Mugnol config is always present if not explicitly saved
    const mugnolIndex = parsed.findIndex((c: any) => c.empresa_id === defaultMugnolConfig.empresa_id);`;

const replacement = `    // Inject default curves to any config that is missing them
    parsed.forEach((c: any) => {
      if (!c.curva_desempenho || c.curva_desempenho.length === 0) {
        c.curva_desempenho = defaultMugnolConfig.curva_desempenho;
      } else {
         const hasPadrao = c.curva_desempenho.find((curve: any) => curve.id === 'mugnol_padrao_2026');
         if (!hasPadrao) {
            c.curva_desempenho.push(defaultMugnolConfig.curva_desempenho[0]);
         }
      }
      if (!c.programa_alimentar || c.programa_alimentar.length === 0) {
        c.programa_alimentar = defaultMugnolConfig.programa_alimentar;
      }
    });

    // Ensure Mugnol config is always present if not explicitly saved
    const mugnolIndex = parsed.findIndex((c: any) => c.empresa_id === defaultMugnolConfig.empresa_id);`;

code = code.replace(target, replacement);

const targetToRemove = `    if (mugnolIndex === -1) {
      parsed.push(defaultMugnolConfig);
    } else {
      // Always ensure we have the specific Mugnol curva and programa alimentar if they are empty
      if (!parsed[mugnolIndex].curva_desempenho || parsed[mugnolIndex].curva_desempenho.length === 0) {
        parsed[mugnolIndex].curva_desempenho = defaultMugnolConfig.curva_desempenho;
      } else {
         const hasPadrao = parsed[mugnolIndex].curva_desempenho.find((c: any) => c.id === 'mugnol_padrao_2026');
         if (!hasPadrao) {
            parsed[mugnolIndex].curva_desempenho.push(defaultMugnolConfig.curva_desempenho[0]);
         }
      }
      
      if (!parsed[mugnolIndex].programa_alimentar || parsed[mugnolIndex].programa_alimentar.length === 0) {
        parsed[mugnolIndex].programa_alimentar = defaultMugnolConfig.programa_alimentar;
      }
    }`;

const newToAdd = `    if (mugnolIndex === -1) {
      parsed.push(defaultMugnolConfig);
    }`;

code = code.replace(targetToRemove, newToAdd);

fs.writeFileSync('src/lib/storage.ts', code);
console.log("Config fallback fixed!");
