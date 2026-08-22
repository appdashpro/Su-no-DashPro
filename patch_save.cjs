const fs = require('fs');
const path = './src/components/EmpresaConfigGestao.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
`      // If config exists, preserve its JSON fields, otherwise default
      curva_desempenho: config?.curva_desempenho || [],`,
`      // If config exists, preserve its JSON fields, otherwise default
      curva_desempenho: curvasConfig,`
);

fs.writeFileSync(path, content);
