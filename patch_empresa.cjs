const fs = require('fs');
const path = './src/components/EmpresaConfigGestao.tsx';
let content = fs.readFileSync(path, 'utf8');

// Restore curva_desempenho mapping
content = content.replace(
  'curva_desempenho: curvasConfig,',
  'curva_desempenho: config?.curva_desempenho || [],'
);

// Remove the Versões de Curvas block
const startIndex = content.indexOf('{/* Versões de Curvas */}');
const endIndex = content.indexOf('{/* Listas Permitidas */}');

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + content.substring(endIndex);
}

// Remove the states
content = content.replace('const [curvasConfig, setCurvasConfig] = useState<CurveConfig[]>([]);\n', '');
content = content.replace('const [isAddingCurva, setIsAddingCurva] = useState(false);\n', '');
content = content.replace('const [newCurva, setNewCurva] = useState<Partial<CurveConfig>>({});\n', '');

// Remove setCurvasConfig from fetchConfig
content = content.replace(
`        if (data.curva_desempenho && Array.isArray(data.curva_desempenho) && data.curva_desempenho.length > 0) {
          if (data.curva_desempenho[0] && 'dia' in data.curva_desempenho[0]) {
            setCurvasConfig([{
               id: 'legacy-migrated',
               nome: 'Curva Legada',
               dataVigencia: '2000-01-01',
               tipoLote: 'Misto',
               tipoCalculo: data.tipo_calculo_curva || 'DIA_UM',
               metaMortalidade: data.meta_mortalidade || 0,
               curve: data.curva_desempenho,
               metas: defaultMetas
            }]);
          } else {
            setCurvasConfig(data.curva_desempenho);
          }
        } else {
          setCurvasConfig([]);
        }`,
''
);

content = content.replace('setCurvasConfig([]);', '');

fs.writeFileSync(path, content);
