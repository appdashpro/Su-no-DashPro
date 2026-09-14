const fs = require('fs');
let code = fs.readFileSync('src/components/EmpresaConfigGestao.tsx', 'utf8');

// Inside fetchConfig:
// Replace the block reading activeData.programa_alimentar
code = code.replace(
  /if \(activeData\.programa_alimentar && activeData\.programa_alimentar\.length > 0 && activeData\.programa_alimentar\[0\]\.fase\) \{[\s\S]*?\} else \{[\s\S]*?setFasesGompertz\(defaultFasesGompertz\);[\s\S]*?\}/,
  `const pData = activeData.curva_desempenho?.find((c: any) => c._type === 'PROGRAMA_ALIMENTAR');
        const activePrograma = pData?.fases || activeData.programa_alimentar || [];
        if (activePrograma.length > 0 && activePrograma[0].fase) {
          setFasesGompertz(activePrograma);
        } else {
          setFasesGompertz(defaultFasesGompertz);
        }`
);

// Inside handleSave:
// Replace payload generation
code = code.replace(
  /const existingCurva = config\?\.curva_desempenho \|\| \[\];[\s\S]*?programa_alimentar: \(tipoCalculo === 'GOMPERTZ' && fasesGompertz\.length > 0\) \? fasesGompertz : \(config\?\.programa_alimentar \|\| \[\]\)[\s\S]*?\};/,
  `const existingCurva = config?.curva_desempenho || [];
    const curvaClean = existingCurva.filter((c: any) => c._type !== 'GOMPERTZ_PARAMS' && c._type !== 'PROGRAMA_ALIMENTAR');
    
    const gompertzData = { _type: 'GOMPERTZ_PARAMS', ...gompertzParams };
    const pFases = (tipoCalculo === 'GOMPERTZ' && fasesGompertz.length > 0) ? fasesGompertz : (config?.programa_alimentar || []);
    const programaData = { _type: 'PROGRAMA_ALIMENTAR', fases: pFases };

    const newCurva = [...curvaClean, gompertzData, programaData];
    
    const payload: any = {
      empresa_id: selectedEmpresaId,
      tipo_calculo_curva: tipoCalculo,
      meta_mortalidade: metaMortalidade,
      medicamentos_permitidos: medicamentos,
      causas_mortalidade: causas,
      tecnicos: tecnicos,
      curva_desempenho: newCurva
    };`
);

fs.writeFileSync('src/components/EmpresaConfigGestao.tsx', code);
