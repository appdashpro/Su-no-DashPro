import { Integrado, Visit, isVisitForIntegrado } from '../types';
import { getActiveCurve, getExpectedConsumption } from '../data';

export interface PriorityScore {
  score: number;
  reasons: string[];
  smartActions: string[];
  daysSinceLastVisit: number | null;
  mortality: number;
  projectedMortality: number;
  treatmentsCount: number;
  feedDeviation: number | null;
  age: number;
}

function getCalendarDaysDiff(fromDateStr: string, toDate: Date = new Date()): number {
  if (!fromDateStr) return 0;
  const dateOnly = fromDateStr.split('T')[0];
  const parts = dateOnly.split('-');
  if (parts.length === 3) {
    const y1 = parseInt(parts[0], 10);
    const m1 = parseInt(parts[1], 10) - 1;
    const d1 = parseInt(parts[2], 10);
    if (!isNaN(y1) && !isNaN(m1) && !isNaN(d1)) {
      const utc1 = Date.UTC(y1, m1, d1);
      const utc2 = Date.UTC(toDate.getFullYear(), toDate.getMonth(), toDate.getDate());
      return Math.max(0, Math.round((utc2 - utc1) / (1000 * 60 * 60 * 24)));
    }
  }
  return 0;
}

export function calculatePriority(integrado: Integrado, allVisits: Visit[]): PriorityScore {
  const visits = allVisits
    .filter(v => isVisitForIntegrado(v, integrado))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
  let score = 0;
  const reasons: string[] = [];
  const smartActions: string[] = [];
  
  const today = new Date();
  let currentAge = 1;
  if (integrado.alojamentoDate) {
    currentAge = Math.max(0, getCalendarDaysDiff(integrado.alojamentoDate, today));
  }
  
  if (visits.length === 0) {
    if (currentAge > 5) {
      smartActions.push('Agendar visita inicial urgentemente');
    }
    return {
      score: 100,
      reasons: ['Lote sem nenhuma visita registrada (Urgente)'],
      smartActions,
      daysSinceLastVisit: null,
      mortality: 0,
      projectedMortality: 0,
      treatmentsCount: 0,
      feedDeviation: null,
      age: currentAge
    };
  }

  const latestVisit = visits[0];
  let ageAtVisit = latestVisit.idade;
  if (!ageAtVisit || isNaN(ageAtVisit)) {
    if (integrado.alojamentoDate) {
      const visitDate = new Date(latestVisit.date + 'T12:00:00');
      ageAtVisit = Math.max(1, getCalendarDaysDiff(integrado.alojamentoDate, visitDate));
    } else {
      ageAtVisit = 1;
    }
  }
  
  // 1. Time since last visit (calculated as pure calendar days to avoid timezone/hour issues)
  const daysSinceLastVisit = getCalendarDaysDiff(latestVisit.date, today);
  
  if (daysSinceLastVisit > 10) {
    score += Math.min(25, (daysSinceLastVisit - 10) * 2 + 5); 
    reasons.push(`Faz ${daysSinceLastVisit} dias desde a última visita`);
    smartActions.push('Necessário realizar acompanhamento presencial');
  } else if (daysSinceLastVisit > 5) {
    score += 5;
    reasons.push(`${daysSinceLastVisit} dias sem visita`);
  }

  // 2. Mortality
  let mortalityPct = 0;
  if (latestVisit.animaisAlojados && latestVisit.animaisAlojados > 0 && latestVisit.animaisMortos !== undefined && latestVisit.animaisMortos > 0) {
    mortalityPct = (latestVisit.animaisMortos / latestVisit.animaisAlojados) * 100;
  } else if (latestVisit.mortalidade !== undefined) {
    mortalityPct = latestVisit.mortalidade;
  }
  
  if (mortalityPct >= 3.0) {
    score += 25 + Math.min(25, (mortalityPct - 3.0) * 5);
    reasons.push(`Mortalidade atual (${mortalityPct.toFixed(2)}%) muito acima da meta`);
    smartActions.push('Investigar causa raiz da mortalidade (Sanidade/Ambiência)');
  } else if (mortalityPct > 2.0) {
    score += 15;
    reasons.push(`Mortalidade em atenção (${mortalityPct.toFixed(2)}%)`);
  }

  // 3. Projected Mortality (Assume ~105 days batch length)
  const projectedMortality = (mortalityPct / ageAtVisit) * 105;
  if (projectedMortality > 3.0 && mortalityPct < 3.0) {
    score += 10;
    reasons.push(`Projeção de mortalidade (${projectedMortality.toFixed(2)}%) supera a meta no fim do lote`);
    if (!smartActions.includes('Investigar causa raiz da mortalidade (Sanidade/Ambiência)')) {
      smartActions.push('Avaliar manejos e medicação para redução da mortalidade');
    }
  }

  // 4. Feed Deviation
  let feedDeviation: number | null = null;
  // Find the most recent visit that actually has feed data
  const visitWithFeed = visits.find(v => v.consumoAcumuladoReal !== undefined && v.consumoAcumuladoReal !== null && Number(v.consumoAcumuladoReal) > 0);
  
  if (visitWithFeed) {
    let feedAge = Number(visitWithFeed.idade) || 0;
    if (feedAge === 0) {
      if (integrado.alojamentoDate) {
        const visitDate = new Date(visitWithFeed.date + 'T12:00:00');
        feedAge = Math.max(1, getCalendarDaysDiff(integrado.alojamentoDate, visitDate));
      } else {
        feedAge = 1;
      }
    }
    
    const expected = getExpectedConsumption(feedAge, visitWithFeed.tipoLote, visitWithFeed.pesoAloj, integrado.alojamentoDate, integrado.status, integrado.fechamentoDate);
    if (expected !== undefined && expected !== null && expected > 0) {
       feedDeviation = Number(visitWithFeed.consumoAcumuladoReal) - expected;
    }
  }

  if (feedDeviation !== null && feedDeviation < -3) { // more than 3kg below expected
    score += 15;
    reasons.push(`Consumo muito abaixo do esperado (Desvio: ${feedDeviation.toFixed(2)} kg)`);
    smartActions.push('Verificar disponibilidade de água, regulagem de comedouros');
  } else if (feedDeviation !== null && feedDeviation < -1) {
    score += 5;
    reasons.push(`Consumo levemente abaixo (Desvio: ${feedDeviation.toFixed(2)} kg)`);
  } else if (feedDeviation !== null && feedDeviation > 3) {
    score += 5;
    reasons.push(`Consumo muito alto, possível desperdício (Desvio: +${feedDeviation.toFixed(2)} kg)`);
    smartActions.push('Ajustar regulagem de comedouros (risco de desperdício)');
  }

  // 5. Treatments History
  let totalTreatments = 0;
  visits.forEach(v => {
    if (v.tratamentos) {
      totalTreatments += v.tratamentos.length;
    }
  });
  
  if (totalTreatments > 0) {
    score += Math.min(15, totalTreatments * 5); // cap at 15 points
    reasons.push(`${totalTreatments} tratamento(s) registrado(s) neste lote`);
    
    // Check if there's a treatment currently ongoing
    if (latestVisit.tratamentos && latestVisit.tratamentos.length > 0) {
      const activeTreatments = latestVisit.tratamentos.some(t => {
        const trDate = new Date(latestVisit.date + 'T12:00:00');
        const endTrDate = new Date(trDate.getTime() + (t.duracaoDias * 24 * 60 * 60 * 1000));
        return today <= endTrDate;
      });
      if (activeTreatments) {
        score += 15;
        reasons.push('Lote com tratamento medicamentoso em andamento');
        smartActions.push('Acompanhar resposta ao tratamento atual');
      }
    }
  }

  return {
    score: Math.min(Math.round(score), 100), // Cap at 100, round to integer
    reasons,
    smartActions,
    daysSinceLastVisit,
    mortality: mortalityPct,
    projectedMortality,
    treatmentsCount: totalTreatments,
    feedDeviation,
    age: currentAge
  };
}
