const fs = require('fs');
let code = fs.readFileSync('src/lib/whatsapp.ts', 'utf8');

const importsToAdd = `import { getActiveCurve } from '../data';\nimport { getEmpresaConfigsLocal } from './storage';\n`;

if (!code.includes('getActiveCurve')) {
  code = code.replace("import { format } from 'date-fns';", "import { format } from 'date-fns';\n" + importsToAdd);
}

// Modify the message generation to get metaAcumulada correctly
const targetStart = `  // Desempenho
  message += \`*⚖️ DESEMPENHO:*\\n\`;`;

const replaceStart = `  const cfgs = getEmpresaConfigsLocal();
  const currentConfig = cfgs.find(c => c.empresa_id === integrado?.empresaId);
  const { metas } = getActiveCurve(integrado?.alojamentoDate, integrado?.status, visit.tipoLote || 'Misto', integrado?.fechamentoDate, currentConfig, visit.curva_consumo_id, visit.date);
  const metaAcumuladaStr = visit.metaAcumulada || metas.metaAcumulada;
  const metaAcumuladaNum = metaAcumuladaStr ? Number(metaAcumuladaStr) : 0;
  
  // Desempenho
  message += \`*⚖️ DESEMPENHO:*\\n\`;`;

if (!code.includes('getActiveCurve(integrado')) {
  code = code.replace(targetStart, replaceStart);
}

const targetMeta = `  if (visit.consumoAcumuladoReal) {
    message += \`- Consumo real acumulado: \${visit.consumoAcumuladoReal.toFixed(2)} kg/cab\\n\`;
  }
  if (visit.metaAcumulada) {
    message += \`- Meta da curva de consumo: \${visit.metaAcumulada.toFixed(2)} kg/cab\\n\`;
  }`;

const replaceMeta = `  if (visit.consumoAcumuladoReal) {
    message += \`- Consumo real acumulado: \${Number(visit.consumoAcumuladoReal).toFixed(2)} kg/cab\\n\`;
  }
  if (metaAcumuladaNum > 0) {
    message += \`- Meta de consumo (Curva): \${metaAcumuladaNum.toFixed(2)} kg/cab\\n\`;
  }
  if (visit.consumoAcumuladoReal && metaAcumuladaNum > 0) {
    const aderencia = (Number(visit.consumoAcumuladoReal) / metaAcumuladaNum) * 100;
    message += \`- Aderência da curva: \${aderencia.toFixed(1)}%\\n\`;
  }`;

code = code.replace(targetMeta, replaceMeta);


const targetSaudeStart = `  // Saúde e Instalações
  if (visit.avaliacao_tecnica) {`;

const replaceSaudeStart = `  // Saúde e Instalações
  if (visit.avaliacao_tecnica || visit.pontuacaoSanitaria !== undefined) {
    message += \`*🩺 SAÚDE E INSTALAÇÕES:*\\n\`;
    if (visit.pontuacaoSanitaria !== undefined && visit.pontuacaoSanitaria !== null) {
      message += \`- Índice Sanitário Global: \${visit.pontuacaoSanitaria}%\\n\`;
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
  }
`;

// Remove the old block entirely
const oldSaudeBlock = `  // Saúde e Instalações
  if (visit.avaliacao_tecnica) {
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

code = code.replace(oldSaudeBlock, replaceSaudeStart);

fs.writeFileSync('src/lib/whatsapp.ts', code);
