const fs = require('fs');
let code = fs.readFileSync('src/lib/whatsapp.ts', 'utf8');

// Replace Desempenho section to include curve data
const targetDesempenho = `// Desempenho
  message += \`*⚖️ DESEMPENHO:*\\n\`;
  message += \`- Idade do lote: \${visit.idade || '--'} dias\\n\`;
  if (visit.pesoAmostradoKg) {
    message += \`- Peso médio amostrado: \${visit.pesoAmostradoKg} kg\\n\`;
  }
  message += \`\\n\`;`;

const replaceDesempenho = `// Desempenho
  message += \`*⚖️ DESEMPENHO:*\\n\`;
  message += \`- Idade do lote: \${visit.idade || '--'} dias\\n\`;
  if (visit.pesoAmostradoKg) {
    message += \`- Peso médio amostrado: \${visit.pesoAmostradoKg} kg\\n\`;
  }
  if (visit.consumoAcumuladoReal) {
    message += \`- Consumo real acumulado: \${visit.consumoAcumuladoReal.toFixed(2)} kg/cab\\n\`;
  }
  if (visit.metaAcumulada) {
    message += \`- Meta da curva de consumo: \${visit.metaAcumulada.toFixed(2)} kg/cab\\n\`;
  }
  message += \`\\n\`;`;

code = code.replace(targetDesempenho, replaceDesempenho);

// Replace Ocorrências section to use percentage
const targetOcorrencias = `// Ocorrências
  if (visit.animaisMortos || visit.descartesPeriodo) {
    message += \`*⚠️ OCORRÊNCIAS (Desde a última visita):*\\n\`;
    if (visit.animaisMortos) message += \`- Mortalidade: \${visit.animaisMortos} cabeças\\n\`;
    if (visit.descartesPeriodo) message += \`- Descartes/Refugos: \${visit.descartesPeriodo} cabeças\\n\`;
    message += \`\\n\`;
  }`;

const replaceOcorrencias = `// Ocorrências
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

code = code.replace(targetOcorrencias, replaceOcorrencias);

// Replace Saúde e Instalações to format as percentage
const targetSaude = `if (visit.avaliacao_tecnica) {
    message += \`*🩺 SAÚDE E INSTALAÇÕES:*\\n\`;
    const { granja, suinos } = visit.avaliacao_tecnica;
    
    // Mostrando apenas notas preocupantes ou relevantes (<=3 como alerta, ou listar as principais)
    // Para simplificar, vou listar todas ou as que têm nota.
    if (granja.ventilacao_cortinas) message += \`- Ventilação/Cortinas: \${granja.ventilacao_cortinas}/5 \${granja.ventilacao_cortinas <= 3 ? '(Alerta)' : ''}\\n\`;
    if (granja.desperdicio_racao) message += \`- Desperdício de Ração: \${granja.desperdicio_racao}/5 \${granja.desperdicio_racao <= 3 ? '(Alerta)' : ''}\\n\`;
    if (granja.limpeza_baias) message += \`- Limpeza das Baias: \${granja.limpeza_baias}/5 \${granja.limpeza_baias <= 3 ? '(Alerta)' : ''}\\n\`;
    
    if (suinos.tosse) message += \`- Tosse: \${suinos.tosse}/5 \${suinos.tosse <= 3 ? '(Alerta)' : ''}\\n\`;
    if (suinos.diarreia) message += \`- Diarreia: \${suinos.diarreia}/5 \${suinos.diarreia <= 3 ? '(Alerta)' : ''}\\n\`;
    message += \`\\n\`;
  }`;

const replaceSaude = `if (visit.avaliacao_tecnica) {
    message += \`*🩺 SAÚDE E INSTALAÇÕES:*\\n\`;
    const { granja, suinos } = visit.avaliacao_tecnica;
    
    const formatScore = (val) => \`\${(val / 5 * 100).toFixed(0)}%\`;
    
    if (granja.ventilacao_cortinas) message += \`- Ventilação/Cortinas: \${formatScore(granja.ventilacao_cortinas)} \${granja.ventilacao_cortinas <= 3 ? '(Alerta)' : ''}\\n\`;
    if (granja.desperdicio_racao) message += \`- Desperdício de Ração: \${formatScore(granja.desperdicio_racao)} \${granja.desperdicio_racao <= 3 ? '(Alerta)' : ''}\\n\`;
    if (granja.limpeza_baias) message += \`- Limpeza das Baias: \${formatScore(granja.limpeza_baias)} \${granja.limpeza_baias <= 3 ? '(Alerta)' : ''}\\n\`;
    
    if (suinos.tosse) message += \`- Tosse: \${formatScore(suinos.tosse)} \${suinos.tosse <= 3 ? '(Alerta)' : ''}\\n\`;
    if (suinos.diarreia) message += \`- Diarreia: \${formatScore(suinos.diarreia)} \${suinos.diarreia <= 3 ? '(Alerta)' : ''}\\n\`;
    message += \`\\n\`;
  }`;

code = code.replace(targetSaude, replaceSaude);

fs.writeFileSync('src/lib/whatsapp.ts', code);
