const fs = require('fs');
let code = fs.readFileSync('src/components/EmpresaConfigGestao.tsx', 'utf8');

// Replace the payload creation
code = code.replace(
  /const payload: Partial<EmpresaConfig> = \{\s*empresa_id: selectedEmpresaId,[\s\S]*?programa_alimentar: config\?.programa_alimentar \|\| \[\]\s*\};/,
  `const existingCurva = config?.curva_desempenho || [];
    const curvaWithoutGompertz = existingCurva.filter((c: any) => c._type !== 'GOMPERTZ_PARAMS');
    const newCurva = [...curvaWithoutGompertz, { _type: 'GOMPERTZ_PARAMS', ...gompertzParams }];
    
    const payload: any = {
      empresa_id: selectedEmpresaId,
      tipo_calculo_curva: tipoCalculo,
      meta_mortalidade: metaMortalidade,
      medicamentos_permitidos: medicamentos,
      causas_mortalidade: causas,
      tecnicos: tecnicos,
      curva_desempenho: newCurva,
      programa_alimentar: config?.programa_alimentar || []
    };`
);

// Replace fetchConfig data activeData reading
code = code.replace(
  /if \(activeData\.gompertz_params\) setGompertzParams\(activeData\.gompertz_params\);/,
  `if (activeData.gompertz_params) {
          setGompertzParams(activeData.gompertz_params);
        } else if (activeData.curva_desempenho) {
          const gParams = activeData.curva_desempenho.find((c: any) => c._type === 'GOMPERTZ_PARAMS');
          if (gParams) {
            setGompertzParams({ pm: gParams.pm, b: gParams.b, em: gParams.em });
          }
        }`
);

fs.writeFileSync('src/components/EmpresaConfigGestao.tsx', code);
