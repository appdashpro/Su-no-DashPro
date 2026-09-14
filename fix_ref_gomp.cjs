const fs = require('fs');

let file = 'src/components/ReferenceCurve.tsx';
let code = fs.readFileSync(file, 'utf8');

const injection = `
        if (activeData.tipo_calculo_curva === 'GOMPERTZ') {
          // Dynamically calculate and display the Gompertz curve
          const { getActiveCurve } = await import('../data');
          const dynamicCurveInfo = getActiveCurve(undefined, undefined, undefined, undefined, activeData);
          setCurvas([{
            id: 'gompertz_dynamic',
            nome: 'Curva Gompertz (Dinâmica)',
            dataVigencia: 'Sempre',
            tipoLote: 'Misto',
            tipoCalculo: 'GOMPERTZ',
            metaMortalidade: activeData.meta_mortalidade || 0,
            curve: dynamicCurveInfo.curve,
            metas: dynamicCurveInfo.metas
          }]);
          setSelectedCurvaId('gompertz_dynamic');
          return;
        }
`;

code = code.replace("if (activeData) {\n        setConfig(activeData);", "if (activeData) {\n        setConfig(activeData);\n" + injection);

fs.writeFileSync(file, code);
