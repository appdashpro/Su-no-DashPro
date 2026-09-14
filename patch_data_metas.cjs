const fs = require('fs');
let code = fs.readFileSync('src/data.ts', 'utf8');

const metasLogic = `
    let metaAlojamento = 0, metaCrescimento1 = 0, metaCrescimento2 = 0, metaCrescimento3 = 0, metaTerminacao1 = 0, metaTerminacao2 = 0;
    const fases = empresaConfig?.programa_alimentar || [];
    if (fases && fases.length > 0 && fases[0].fase) {
      let currentDay = 0;
      const getMetaForPhase = (faseName) => {
        const faseConfig = fases.find((f) => f.fase === faseName);
        if (!faseConfig) return 0;
        let duration = faseConfig.duracaoDias || 0;
        let total = 0;
        for (let i = 0; i < duration; i++) {
          if (currentDay < curve.length) {
            total += curve[currentDay].cmd;
            currentDay++;
          }
        }
        return Number(total.toFixed(2));
      };
      
      metaAlojamento = getMetaForPhase('Alojamento');
      metaCrescimento1 = getMetaForPhase('Crescimento 1');
      metaCrescimento2 = getMetaForPhase('Crescimento 2');
      metaCrescimento3 = getMetaForPhase('Crescimento 3');
      metaTerminacao1 = getMetaForPhase('Terminação 1');
      metaTerminacao2 = getMetaForPhase('Terminação 2');
    }
    
    return {
      id: 'gompertz',
      curve: curve,
      metas: {
        metaAlojamento,
        metaCrescimento1,
        metaCrescimento2,
        metaCrescimento3,
        metaTerminacao1,
        metaTerminacao2,
        metaAcumulada: curve[curve.length - 1].consumoAcumulado
      },
      tipoCalculo: 'GOMPERTZ'
    };
`;

code = code.replace(
  /return \{\s*id: 'gompertz',\s*curve: curve,\s*metas: \{[\s\S]*?metaAcumulada: curve\[curve\.length - 1\]\.consumoAcumulado\s*\},\s*tipoCalculo: 'GOMPERTZ'\s*\};/,
  metasLogic
);

fs.writeFileSync('src/data.ts', code);
