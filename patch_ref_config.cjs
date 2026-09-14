const fs = require('fs');
let code = fs.readFileSync('src/components/ReferenceCurve.tsx', 'utf8');

code = code.replace(
  /setConfig\(activeData\);/,
  `// Extract nested programa_alimentar if it exists
        let pAlimentar = activeData.programa_alimentar;
        if (activeData.curva_desempenho) {
          const pData = activeData.curva_desempenho.find((c: any) => c._type === 'PROGRAMA_ALIMENTAR');
          if (pData && pData.fases) {
            pAlimentar = pData.fases;
          }
        }
        setConfig({ ...activeData, programa_alimentar: pAlimentar });`
);

fs.writeFileSync('src/components/ReferenceCurve.tsx', code);
