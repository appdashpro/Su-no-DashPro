const fs = require('fs');
let code = fs.readFileSync('src/lib/whatsapp.ts', 'utf8');

const regex = /\/\/ Saúde e Instalações[\s\S]*?message \+= \`\\n\`;\n  \}/m;

const replaceSaude = `// Saúde e Instalações
  if (visit.avaliacao_tecnica || (visit.pontuacaoSanitaria !== undefined && visit.pontuacaoSanitaria !== null)) {
    message += \`*🩺 SANIDADE E INSTALAÇÕES:*\\n\`;
    
    if (visit.pontuacaoSanitaria !== undefined && visit.pontuacaoSanitaria !== null) {
      message += \`Índice Global: \${visit.pontuacaoSanitaria}%\\n\`;
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
      if (granja.ventilacao_cortinas) granjaParts.push(\`Ventilação (\${getStatusText(granja.ventilacao_cortinas)})\`);
      if (granja.desperdicio_racao) granjaParts.push(\`Desperdício (\${getStatusText(granja.desperdicio_racao)})\`);
      if (granja.limpeza_baias) granjaParts.push(\`Limpeza (\${getStatusText(granja.limpeza_baias)})\`);
      if (granjaParts.length > 0) message += \`• Instalações: \${granjaParts.join(' | ')}\\n\`;
      
      const suinosParts = [];
      if (suinos.tosse) suinosParts.push(\`Tosse (\${getStatusText(suinos.tosse)})\`);
      if (suinos.diarreia) suinosParts.push(\`Diarreia (\${getStatusText(suinos.diarreia)})\`);
      if (suinosParts.length > 0) message += \`• Animais: \${suinosParts.join(' | ')}\\n\`;
    }
    message += \`\\n\`;
  }`;

code = code.replace(regex, replaceSaude);
fs.writeFileSync('src/lib/whatsapp.ts', code);
