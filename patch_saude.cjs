const fs = require('fs');
let code = fs.readFileSync('src/lib/whatsapp.ts', 'utf8');

const targetSaude = `if (visit.avaliacao_tecnica) {
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

const replaceSaude = `if (visit.avaliacao_tecnica) {
    message += \`*🩺 SAÚDE E INSTALAÇÕES:*\\n\`;
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
    message += \`\\n\`;
  }`;

code = code.replace(targetSaude, replaceSaude);
fs.writeFileSync('src/lib/whatsapp.ts', code);
