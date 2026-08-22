const fs = require('fs');
const path = './src/components/EmpresaConfigGestao.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
`      if (data) {
        setConfig(data);
        setTipoCalculo(data.tipo_calculo_curva || 'DIA_UM');
        setMetaMortalidade(data.meta_mortalidade || 0);
        setMedicamentos((data.medicamentos_permitidos && data.medicamentos_permitidos.length > 0) ? data.medicamentos_permitidos : DEFAULT_MEDICAMENTOS_PERMITIDOS);
        setCausas((data.causas_mortalidade && data.causas_mortalidade.length > 0) ? data.causas_mortalidade : DEFAULT_CAUSAS_MORTALIDADE);`,
`      if (data) {
        setConfig(data);
        setTipoCalculo(data.tipo_calculo_curva || 'DIA_UM');
        setMetaMortalidade(data.meta_mortalidade || 0);
        setMedicamentos((data.medicamentos_permitidos && data.medicamentos_permitidos.length > 0) ? data.medicamentos_permitidos : DEFAULT_MEDICAMENTOS_PERMITIDOS);
        setCausas((data.causas_mortalidade && data.causas_mortalidade.length > 0) ? data.causas_mortalidade : DEFAULT_CAUSAS_MORTALIDADE);
        
        if (data.curva_desempenho && Array.isArray(data.curva_desempenho) && data.curva_desempenho.length > 0) {
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
        }`
);

content = content.replace(
`      } else {
        setConfig(null);
        setTipoCalculo('DIA_UM');
        setMetaMortalidade(0);
        setMedicamentos(DEFAULT_MEDICAMENTOS_PERMITIDOS);
        setCausas(DEFAULT_CAUSAS_MORTALIDADE);
      }`,
`      } else {
        setConfig(null);
        setTipoCalculo('DIA_UM');
        setMetaMortalidade(0);
        setMedicamentos(DEFAULT_MEDICAMENTOS_PERMITIDOS);
        setCausas(DEFAULT_CAUSAS_MORTALIDADE);
        setCurvasConfig([]);
      }`
);

fs.writeFileSync(path, content);
