const fs = require('fs');
let code = fs.readFileSync('src/lib/whatsapp.ts', 'utf8');

const regex = /\/\/ Saúde e Instalações[\s\S]*?message \+= \`\\n\`;\n  \}/m;

const replaceSaudeStart = `// Saúde e Instalações
  if (visit.avaliacao_tecnica || (visit.pontuacaoSanitaria !== undefined && visit.pontuacaoSanitaria !== null)) {
    message += \`*🩺 SAÚDE E INSTALAÇÕES:*\\n\`;
    
    if (visit.pontuacaoSanitaria !== undefined && visit.pontuacaoSanitaria !== null) {
      message += \`- Índice Sanitário Global: \${visit.pontuacaoSanitaria}\\n\`;
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

code = code.replace(regex, replaceSaudeStart);
fs.writeFileSync('src/lib/whatsapp.ts', code);
