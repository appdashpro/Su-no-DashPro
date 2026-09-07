const fs = require('fs');
let code = fs.readFileSync('src/lib/whatsapp.ts', 'utf8');

// 1. Compact Desempenho
const targetDesempenho = `// Desempenho
  message += \`*⚖️ DESEMPENHO:*\\n\`;
  message += \`- Idade do lote: \${visit.idade || '--'} dias\\n\`;
  if (visit.pesoAmostradoKg) {
    message += \`- Peso médio amostrado: \${visit.pesoAmostradoKg} kg\\n\`;
  }
  if (visit.consumoAcumuladoReal) {
    message += \`- Consumo real acumulado: \${Number(visit.consumoAcumuladoReal).toFixed(2)} kg/cab\\n\`;
  }
  if (metaAcumuladaNum > 0) {
    message += \`- Meta de consumo (Curva): \${metaAcumuladaNum.toFixed(2)} kg/cab\\n\`;
  }
  if (visit.consumoAcumuladoReal && metaAcumuladaNum > 0) {
    const aderencia = (Number(visit.consumoAcumuladoReal) / metaAcumuladaNum) * 100;
    message += \`- Aderência da curva: \${aderencia.toFixed(1)}%\\n\`;
  }
  message += \`\\n\`;`;

const replaceDesempenho = `// Desempenho
  message += \`*⚖️ DESEMPENHO:*\\n\`;
  const idadeStr = visit.idade ? \`\${visit.idade} dias\` : '--';
  const pesoStr = visit.pesoAmostradoKg ? \` | Peso: \${visit.pesoAmostradoKg} kg\` : '';
  message += \`Idade: \${idadeStr}\${pesoStr}\\n\`;
  
  if (visit.consumoAcumuladoReal || metaAcumuladaNum > 0) {
    const consStr = visit.consumoAcumuladoReal ? \`\${Number(visit.consumoAcumuladoReal).toFixed(2)} kg\` : '--';
    const metaStr = metaAcumuladaNum > 0 ? \`\${metaAcumuladaNum.toFixed(2)} kg\` : '--';
    let aderenciaStr = '';
    if (visit.consumoAcumuladoReal && metaAcumuladaNum > 0) {
      const aderencia = (Number(visit.consumoAcumuladoReal) / metaAcumuladaNum) * 100;
      aderenciaStr = \` | Aderência: \${aderencia.toFixed(1)}%\`;
    }
    message += \`Consumo: \${consStr} | Meta: \${metaStr}\${aderenciaStr}\\n\`;
  }
  message += \`\\n\`;`;

code = code.replace(targetDesempenho, replaceDesempenho);

// 2. Fix Ocorrências
const targetOcorrencias = `// Ocorrências
  if (visit.animaisMortos || visit.descartesPeriodo) {
    message += \`*⚠️ OCORRÊNCIAS (Desde a última visita):*\\n\`;
    const alojados = visit.animaisAlojados || 0;
    if (visit.animaisMortos) {
      const percMortos = alojados > 0 ? ((visit.animaisMortos / alojados) * 100).toFixed(2) + '%' : '';
      message += \`- Mortalidade: \${visit.animaisMortos} cabeças \${percMortos ? \`(\${percMortos})\` : ''}\\n\`;
    }
    if (visit.descartesPeriodo) {
      const percDescartes = alojados > 0 ? ((visit.descartesPeriodo / alojados) * 100).toFixed(2) + '%' : '';
      message += \`- Descartes/Refugos: \${visit.descartesPeriodo} cabeças \${percDescartes ? \`(\${percDescartes})\` : ''}\\n\`;
    }
    message += \`\\n\`;
  }`;

const replaceOcorrencias = `// Ocorrências
  if (visit.animaisMortos || visit.descartesPeriodo) {
    message += \`*⚠️ MORTALIDADE ATUAL:*\\n\`;
    const alojados = visit.animaisAlojados || 0;
    const parts = [];
    if (visit.animaisMortos) {
      const percMortos = alojados > 0 ? ((visit.animaisMortos / alojados) * 100).toFixed(2) + '%' : '';
      parts.push(\`Mortos: \${visit.animaisMortos} \${percMortos ? \`(\${percMortos})\` : ''}\`);
    }
    if (visit.descartesPeriodo) {
      const percDescartes = alojados > 0 ? ((visit.descartesPeriodo / alojados) * 100).toFixed(2) + '%' : '';
      parts.push(\`Descartes: \${visit.descartesPeriodo} \${percDescartes ? \`(\${percDescartes})\` : ''}\`);
    }
    message += parts.join(' | ') + '\\n\\n';
  }`;

code = code.replace(targetOcorrencias, replaceOcorrencias);

// 3. Compact Saúde
const regexSaude = /\/\/ Saúde e Instalações[\s\S]*?message \+= \`\\n\`;\n  \}/m;

const replaceSaude = `// Saúde e Instalações
  if (visit.avaliacao_tecnica || (visit.pontuacaoSanitaria !== undefined && visit.pontuacaoSanitaria !== null)) {
    message += \`*🩺 SAÚDE E INSTALAÇÕES:*\\n\`;
    
    if (visit.pontuacaoSanitaria !== undefined && visit.pontuacaoSanitaria !== null) {
      message += \`Índice Sanitário Global: \${visit.pontuacaoSanitaria}%\\n\`;
    }
    
    if (visit.avaliacao_tecnica) {
      const { granja, suinos } = visit.avaliacao_tecnica;
      const getStatusText = (val) => {
        if (val === 1) return 'Bom ✅';
        if (val === 2) return 'Regular ⚠️';
        if (val === 3) return 'Ruim ❌';
        return '';
      };
      
      const granjaParts = [];
      if (granja.ventilacao_cortinas) granjaParts.push(\`Ventilação: \${getStatusText(granja.ventilacao_cortinas)}\`);
      if (granja.desperdicio_racao) granjaParts.push(\`Desperdício: \${getStatusText(granja.desperdicio_racao)}\`);
      if (granja.limpeza_baias) granjaParts.push(\`Limpeza: \${getStatusText(granja.limpeza_baias)}\`);
      if (granjaParts.length > 0) message += \`Granja ➔ \${granjaParts.join(' | ')}\\n\`;
      
      const suinosParts = [];
      if (suinos.tosse) suinosParts.push(\`Tosse: \${getStatusText(suinos.tosse)}\`);
      if (suinos.diarreia) suinosParts.push(\`Diarreia: \${getStatusText(suinos.diarreia)}\`);
      if (suinosParts.length > 0) message += \`Suínos ➔ \${suinosParts.join(' | ')}\\n\`;
    }
    message += \`\\n\`;
  }`;

code = code.replace(regexSaude, replaceSaude);

fs.writeFileSync('src/lib/whatsapp.ts', code);
