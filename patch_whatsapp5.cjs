const fs = require('fs');
let code = fs.readFileSync('src/lib/whatsapp.ts', 'utf8');

// 1. Aderência fix
const replaceAderencia = `const metaConsumoEsperado = getExpectedConsumption(visit.idade || 0, visit.tipoLote, visit.pesoAloj, integrado?.alojamentoDate, integrado?.status, integrado?.fechamentoDate, currentConfig, visit.curva_consumo_id, visit.date);
  const metaAcumuladaNum = metaConsumoEsperado > 0 ? metaConsumoEsperado : (visit.metaAcumulada ? Number(visit.metaAcumulada) : metas.metaAcumulada || 0);
  
  // Desempenho
  message += \`*⚖️ DESEMPENHO:*\\n\`;
  const idadeStr = visit.idade ? \`\${visit.idade} dias\` : '--';
  const pesoStr = visit.pesoAmostradoKg ? \` | Peso: \${visit.pesoAmostradoKg} kg\` : '';
  message += \`Idade: \${idadeStr}\${pesoStr}\\n\`;
  
  if (visit.consumoAcumuladoReal || metaAcumuladaNum > 0) {
    const realConsumo = visit.consumoAcumuladoReal ? Number(visit.consumoAcumuladoReal) : 0;
    const consStr = visit.consumoAcumuladoReal ? \`\${realConsumo.toFixed(2)} kg\` : '--';
    const metaStr = metaAcumuladaNum > 0 ? \`\${metaAcumuladaNum.toFixed(2)} kg\` : '--';
    let aderenciaStr = '';
    
    if (realConsumo > 0 && metaAcumuladaNum > 0) {
      const aderencia = Math.max(0, 100 - (Math.abs(realConsumo - metaAcumuladaNum) / metaAcumuladaNum * 100));
      aderenciaStr = \` | Aderência: \${aderencia.toFixed(1)}%\`;
    }`;

code = code.replace(/const metaConsumoEsperado = getExpectedConsumption[\s\S]*?aderenciaStr = \` \| Aderência: \$\{aderencia\.toFixed\(1\)\}%\`;\n    \}/m, replaceAderencia);


// 2. Saúde e Instalações Layout and Calculation
const regexSaude = /\/\/ Saúde e Instalações[\s\S]*?message \+= \`\\n\`;\n  \}/m;

const replaceSaude = `// Saúde e Instalações
  if (visit.avaliacao_tecnica || (visit.pontuacaoSanitaria !== undefined && visit.pontuacaoSanitaria !== null)) {
    message += \`*🩺 SAÚDE E INSTALAÇÕES:*\\n\`;
    
    let calculatedIndex = 0;
    if (visit.avaliacao_tecnica) {
      const { granja, suinos } = visit.avaliacao_tecnica;
      const parseScore = (val) => {
        if (val === 1) return 3; // Bom
        if (val === 2) return 2; // Regular
        if (val === 3) return 1; // Ruim
        return 0;
      };
      const scores = [
        parseScore(granja?.limpeza_baias),
        parseScore(granja?.desperdicio_racao),
        parseScore(granja?.ventilacao_cortinas),
        parseScore(granja?.ficha_lote),
        parseScore(suinos?.tosse),
        parseScore(suinos?.diarreia),
        parseScore(suinos?.uniformidade),
        parseScore(suinos?.canibalismo),
        parseScore(suinos?.prolapso),
        parseScore(suinos?.parecer_medicacao)
      ];
      
      const validScores = scores.filter(s => s > 0);
      const totalScore = validScores.reduce((sum, s) => sum + s, 0);
      const maxPossibleScore = validScores.length * 3;
      calculatedIndex = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
    }
    
    const finalIndex = (visit.pontuacaoSanitaria !== undefined && visit.pontuacaoSanitaria !== null && String(visit.pontuacaoSanitaria).trim() !== '') ? Number(visit.pontuacaoSanitaria) : calculatedIndex;
    
    if (finalIndex > 0) {
      message += \`- Índice Sanitário Global: \${Math.round(finalIndex)}%\\n\`;
    }
    
    if (visit.avaliacao_tecnica) {
      const { granja, suinos } = visit.avaliacao_tecnica;
      const getStatusText = (val) => {
        if (val === 1) return 'Bom ✅';
        if (val === 2) return 'Regular ⚠️';
        if (val === 3) return 'Ruim ❌';
        return '';
      };
      
      if (granja.ventilacao_cortinas) message += \`- Ventilação/Cortinas: \${getStatusText(granja.ventilacao_cortinas)}\\n\`;
      if (granja.desperdicio_racao) message += \`- Desperdício de Ração: \${getStatusText(granja.desperdicio_racao)}\\n\`;
      if (granja.limpeza_baias) message += \`- Limpeza das Baias: \${getStatusText(granja.limpeza_baias)}\\n\`;
      
      if (suinos.tosse) message += \`- Tosse: \${getStatusText(suinos.tosse)}\\n\`;
      if (suinos.diarreia) message += \`- Diarreia: \${getStatusText(suinos.diarreia)}\\n\`;
    }
    message += \`\\n\`;
  }`;

code = code.replace(regexSaude, replaceSaude);
fs.writeFileSync('src/lib/whatsapp.ts', code);
