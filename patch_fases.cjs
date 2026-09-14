const fs = require('fs');
let code = fs.readFileSync('src/components/EmpresaConfigGestao.tsx', 'utf8');

const DEFAULT_FASES = `
const defaultFasesGompertz = [
  { fase: 'Alojamento', duracaoDias: 14 },
  { fase: 'Crescimento 1', duracaoDias: 14 },
  { fase: 'Crescimento 2', duracaoDias: 14 },
  { fase: 'Crescimento 3', duracaoDias: 14 },
  { fase: 'Terminação 1', duracaoDias: 14 },
  { fase: 'Terminação 2', duracaoDias: 50 } // Remainder
];`;

if (!code.includes('defaultFasesGompertz')) {
  code = code.replace(
    /import \{ getEmpresaConfigsLocal \} from '\.\.\/lib\/storage';/,
    `import { getEmpresaConfigsLocal } from '../lib/storage';\n${DEFAULT_FASES}`
  );
}

if (!code.includes('const [fasesGompertz')) {
  code = code.replace(
    /const \[gompertzParams, setGompertzParams\] = useState\(\{ pm: 260, b: 0.012, em: 3780 \}\);/,
    `const [gompertzParams, setGompertzParams] = useState({ pm: 260, b: 0.012, em: 3780 });
  const [fasesGompertz, setFasesGompertz] = useState(defaultFasesGompertz);`
  );
}

// Inside fetchConfig, load fasesGompertz from programa_alimentar if available
code = code.replace(
  /if \(activeData\.gompertz_params\) \{/,
  `if (activeData.programa_alimentar && activeData.programa_alimentar.length > 0 && activeData.programa_alimentar[0].fase) {
          setFasesGompertz(activeData.programa_alimentar);
        } else {
          setFasesGompertz(defaultFasesGompertz);
        }
        if (activeData.gompertz_params) {`
);

// Reset phases in the `else` branch of fetchConfig
code = code.replace(
  /setTipoCalculo\('DIA_UM'\);/,
  `setTipoCalculo('DIA_UM');
        setFasesGompertz(defaultFasesGompertz);`
);

// In payload creation, inject fasesGompertz as programa_alimentar
code = code.replace(
  /programa_alimentar: config\?\.programa_alimentar \|\| \[\]/,
  `programa_alimentar: (tipoCalculo === 'GOMPERTZ' && fasesGompertz.length > 0) ? fasesGompertz : (config?.programa_alimentar || [])`
);

fs.writeFileSync('src/components/EmpresaConfigGestao.tsx', code);
