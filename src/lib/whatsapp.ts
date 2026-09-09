import { Visit, Integrado, CatalogoProduto } from '../types';
import { format } from 'date-fns';
import { getActiveCurve, getExpectedConsumption } from '../data';
import { getEmpresaConfigsLocal } from './storage';


export function generateWhatsAppSummary(visit: Visit, integrado?: Integrado, produtos?: CatalogoProduto[]): string {
  if (!visit) return '';

  const dataFormatada = visit.date ? format(new Date(visit.date + 'T12:00:00Z'), 'dd/MM/yyyy') : 'Data não informada';
  const produtorNome = integrado ? integrado.name : 'Produtor não identificado';
  const tecnicoNome = visit.colaborador || 'Técnico';

  let message = `*📋 RESUMO DA VISITA TÉCNICA*\n*Produtor:* ${produtorNome}\n*Data:* ${dataFormatada}\n*Técnico:* ${tecnicoNome}\n\n`;

  const cfgs = getEmpresaConfigsLocal();
  const currentConfig = cfgs.find((c: any) => c.empresa_id === integrado?.empresaId);
  const { metas } = getActiveCurve(integrado?.alojamentoDate, integrado?.status, visit.tipoLote || 'Misto', integrado?.fechamentoDate, currentConfig, visit.curva_consumo_id, visit.date);
  
  // A meta de consumo na visita geralmente reflete o esperado para a IDADE do lote
  const metaConsumoEsperado = getExpectedConsumption(visit.idade || 0, visit.tipoLote, visit.pesoAloj, integrado?.alojamentoDate, integrado?.status, integrado?.fechamentoDate, currentConfig, visit.curva_consumo_id, visit.date);
  const metaAcumuladaNum = metaConsumoEsperado > 0 ? metaConsumoEsperado : (visit.metaAcumulada ? Number(visit.metaAcumulada) : metas.metaAcumulada || 0);
  
  // Desempenho
  message += `*⚖️ DESEMPENHO:*\n`;
  const idadeStr = visit.idade ? `${visit.idade} dias` : '--';
  const pesoStr = visit.pesoAmostradoKg ? ` | Peso: ${visit.pesoAmostradoKg} kg` : '';
  message += `Idade: ${idadeStr}${pesoStr}\n`;
  
  if (visit.consumoAcumuladoReal || metaAcumuladaNum > 0) {
    const realConsumo = visit.consumoAcumuladoReal ? Number(visit.consumoAcumuladoReal) : 0;
    const consStr = visit.consumoAcumuladoReal ? `${realConsumo.toFixed(2)} kg` : '--';
    const metaStr = metaAcumuladaNum > 0 ? `${metaAcumuladaNum.toFixed(2)} kg` : '--';
    let aderenciaStr = '';
    
    if (realConsumo > 0 && metaAcumuladaNum > 0) {
      const aderencia = Math.max(0, 100 - (Math.abs(realConsumo - metaAcumuladaNum) / metaAcumuladaNum * 100));
      aderenciaStr = ` | Aderência: ${aderencia.toFixed(1)}%`;
    }
    message += `Consumo: ${consStr} | Meta: ${metaStr}${aderenciaStr}\n`;
  }
  message += `\n`;

  // Ocorrências
  if (visit.animaisMortos || visit.descartesPeriodo) {
    message += `*⚠️ MORTALIDADE ATUAL:*\n`;
    const alojados = visit.animaisAlojados || 0;
    const parts = [];
    if (visit.animaisMortos) {
      const percMortos = alojados > 0 ? ((visit.animaisMortos / alojados) * 100).toFixed(2) + '%' : '';
      parts.push(`Mortos: ${visit.animaisMortos} ${percMortos ? `(${percMortos})` : ''}`);
    }
    if (visit.descartesPeriodo) {
      const percDescartes = alojados > 0 ? ((visit.descartesPeriodo / alojados) * 100).toFixed(2) + '%' : '';
      parts.push(`Descartes: ${visit.descartesPeriodo} ${percDescartes ? `(${percDescartes})` : ''}`);
    }
    message += parts.join(' | ') + '\n\n';
  }

  // Saúde e Instalações
  if (visit.avaliacao_tecnica || (visit.pontuacaoSanitaria !== undefined && visit.pontuacaoSanitaria !== null)) {
    message += `*🩺 SAÚDE E INSTALAÇÕES:*\n`;
    
    let calculatedIndex = 0;
    if (visit.avaliacao_tecnica) {
      const { granja, suinos } = visit.avaliacao_tecnica;
      const parseScore = (val?: number) => {
        if (val === 1) return 3; // Bom
        if (val === 2) return 2; // Regular
        if (val === 3) return 1; // Ruim
        return 0;
      };
      const scores = [
        parseScore(granja?.limpeza_baias),
        parseScore(granja?.desperdicio_racao),
        parseScore(granja?.ventilacao_cortinas),
        parseScore(suinos?.tosse),
        parseScore(suinos?.diarreia),
        parseScore(suinos?.uniformidade),
        parseScore(suinos?.canibalismo)
      ];
      
      const validScores = scores.filter(s => s > 0);
      const totalScore = validScores.reduce((sum, s) => sum + s, 0);
      const maxPossibleScore = validScores.length * 3;
      calculatedIndex = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
    }
    
    const finalIndex = (visit.pontuacaoSanitaria !== undefined && visit.pontuacaoSanitaria !== null && String(visit.pontuacaoSanitaria).trim() !== '') ? Number(visit.pontuacaoSanitaria) : calculatedIndex;
    
    if (finalIndex > 0) {
      message += `- Índice Sanitário Global: ${Math.round(finalIndex)}%\n`;
    }
    
    if (visit.avaliacao_tecnica) {
      const { granja, suinos } = visit.avaliacao_tecnica;
      const getStatusText = (val?: number) => {
        if (val === 1) return 'Bom ✅';
        if (val === 2) return 'Regular ⚠️';
        if (val === 3) return 'Ruim ❌';
        return '';
      };
      
      if (granja.ventilacao_cortinas) message += `- Ventilação/Cortinas: ${getStatusText(granja.ventilacao_cortinas)}\n`;
      if (granja.desperdicio_racao) message += `- Desperdício de Ração: ${getStatusText(granja.desperdicio_racao)}\n`;
      if (granja.limpeza_baias) message += `- Limpeza das Baias: ${getStatusText(granja.limpeza_baias)}\n`;
      
      if (suinos.tosse) message += `- Tosse: ${getStatusText(suinos.tosse)}\n`;
      if (suinos.diarreia) message += `- Diarreia: ${getStatusText(suinos.diarreia)}\n`;
      if (suinos.uniformidade) message += `- Uniformidade: ${getStatusText(suinos.uniformidade)}\n`;
      if (suinos.canibalismo) message += `- Canibalismo: ${getStatusText(suinos.canibalismo)}\n`;
    }
    message += `\n`;
  }

  // Tratamentos
  if (visit.tratamentos && visit.tratamentos.length > 0) {
    message += `*💊 TRATAMENTOS:*\n`;
    visit.tratamentos.forEach(t => {
      message += `- ${t.produto}: Tratar por ${t.duracaoDias} dias${t.motivo ? ` (Motivo: ${t.motivo})` : ''}.\n`;
      if (t.quantidadeTotal) {
        message += `  Consumo estimado: ${t.quantidadeTotal.toFixed(2)} kg.\n`;
      }
    });
    message += `\n`;
  }

  // Entregas
  if (visit.entregas && visit.entregas.length > 0) {
    message += `*📦 ENTREGAS:*\n`;
    visit.entregas.forEach(e => {
      const prodName = e.produto_nome || produtos?.find(p => p.id === e.produto_id)?.nome || 'Produto';
      message += `- ${e.quantidade}x ${prodName}\n`;
    });
    message += `\n`;
  }

  // Recomendações
  if (visit.recomendacao && visit.recomendacao.trim() !== '') {
    message += `*📝 RECOMENDAÇÕES:*\n${visit.recomendacao.trim()}\n`;
  }

  return encodeURIComponent(message);
}
