import { Visit, Integrado, isVisitForIntegrado } from '../types';
import { getExpectedConsumption, getActiveCurve } from '../data';

/**
 * Retorna o número de animais vivos no período de uma visita.
 * Fórmula Cargill: Animais Alojados - Animais Mortos - Descartes
 */
export function calculateAnimalsAlive(visit: Partial<Visit>): number {
  const alojados = Number(visit.animaisAlojados) || 0;
  const mortos = Number(visit.animaisMortos) || 0;
  const descartes = Number(visit.descartesPeriodo) || 0;
  if (alojados <= 0) return 0;
  return Math.max(0, alojados - mortos - descartes);
}

/**
 * Retorna o volume total de ração fornecido (em kg).
 * Se volumeTotalCargas estiver informado, utiliza-o.
 * Caso contrário, soma todas as cargas de todas as fases nutricionais.
 */
export function calculateTotalFeedVolume(visit: Partial<Visit>): number {
  if (visit.volumeTotalCargas !== undefined && visit.volumeTotalCargas !== null && String(visit.volumeTotalCargas).trim() !== '') {
    const val = Number(visit.volumeTotalCargas);
    if (!isNaN(val) && val > 0) return val;
  }
  
  const cargaAloj = Number(visit.cargaAlojamento) || 0;
  const cargaC1 = Number(visit.cargaCrescimento1) || 0;
  const cargaC2 = Number(visit.cargaCrescimento2) || 0;
  const cargaC3 = Number(visit.cargaCrescimento3) || 0;
  const cargaT1 = Number(visit.cargaTerminacao1) || 0;
  const cargaT2 = Number(visit.cargaTerminacao2) || 0;
  
  return cargaAloj + cargaC1 + cargaC2 + cargaC3 + cargaT1 + cargaT2;
}

/**
 * Retorna o consumo acumulado real (kg/cabeça) de uma visita de forma reativa.
 * 1. Se `consumoAcumuladoReal` estiver salvo e for > 0, usa-o.
 * 2. Se houver volume total de ração e animais vivos, calcula:
 *    Consumo Real = (Volume Total de Cargas - Sobra de Silo) / Animais Vivos
 */
export function calculateRealConsumption(visit: Partial<Visit>): number {
  if (visit.consumoAcumuladoReal !== undefined && visit.consumoAcumuladoReal !== null && String(visit.consumoAcumuladoReal).trim() !== '') {
    const val = Number(visit.consumoAcumuladoReal);
    if (!isNaN(val) && val > 0) return Number(val.toFixed(2));
  }

  const volumeTotal = calculateTotalFeedVolume(visit);
  const vivos = calculateAnimalsAlive(visit);

  if (volumeTotal > 0 && vivos > 0) {
    return Number((volumeTotal / vivos).toFixed(2));
  }

  return 0;
}

/**
 * Retorna o consumo médio por animal de uma fase específica.
 */
export function calculatePhaseConsumption(
  visit: Partial<Visit>,
  phase: 'alojamento' | 'crescimento1' | 'crescimento2' | 'crescimento3' | 'terminacao1' | 'terminacao2'
): number | null {
  const consumoKey = `consumo${phase.charAt(0).toUpperCase() + phase.slice(1)}` as keyof Visit;
  const cargaKey = `carga${phase.charAt(0).toUpperCase() + phase.slice(1)}` as keyof Visit;

  const rawConsumo = visit[consumoKey];
  if (rawConsumo !== undefined && rawConsumo !== null && String(rawConsumo).trim() !== '') {
    const val = Number(rawConsumo);
    if (!isNaN(val) && val > 0) return Number(val.toFixed(2));
  }

  const rawCarga = visit[cargaKey];
  const vivos = calculateAnimalsAlive(visit);
  if (rawCarga !== undefined && rawCarga !== null && vivos > 0) {
    const valCarga = Number(rawCarga);
    if (!isNaN(valCarga) && valCarga > 0) {
      return Number((valCarga / vivos).toFixed(2));
    }
  }

  return null;
}

/**
 * Calcula ou resolve a idade do lote no momento da visita.
 */
export function calculateVisitAge(visit: Partial<Visit>, integrado?: Integrado): number {
  if (visit.idade !== undefined && visit.idade !== null && !isNaN(Number(visit.idade)) && Number(visit.idade) > 0) {
    return Number(visit.idade);
  }

  if (visit.date && integrado?.alojamentoDate) {
    const dateV = new Date(visit.date + 'T12:00:00');
    const dateAloj = new Date(integrado.alojamentoDate + 'T12:00:00');
    if (!isNaN(dateV.getTime()) && !isNaN(dateAloj.getTime())) {
      const diff = Math.round((dateV.getTime() - dateAloj.getTime()) / (1000 * 60 * 60 * 24));
      return Math.max(1, diff);
    }
  }

  return 1;
}

/**
 * Retorna a taxa de mortalidade (%) da visita.
 */
export function calculateMortalityRate(visit: Partial<Visit>): number {
  const alojados = Number(visit.animaisAlojados) || 0;
  const mortos = Number(visit.animaisMortos);

  if (alojados > 0 && !isNaN(mortos) && mortos >= 0) {
    return Number(((mortos / alojados) * 100).toFixed(2));
  }

  if (visit.mortalidade !== undefined && visit.mortalidade !== null && !isNaN(Number(visit.mortalidade))) {
    return Number(Number(visit.mortalidade).toFixed(2));
  }

  return 0;
}

/**
 * Avalia o desvio de consumo em relação à curva oficial da Cargill.
 */
export function calculateVisitFeedDeviation(visit: Partial<Visit>, integrado?: Integrado) {
  const realConsumo = calculateRealConsumption(visit);
  const idade = calculateVisitAge(visit, integrado);
  const tipoLote = (visit.tipoLote as any) || 'Misto';
  const pesoAloj = visit.pesoAloj ? Number(visit.pesoAloj) : undefined;

  const expectedConsumo = getExpectedConsumption(
    idade,
    tipoLote,
    pesoAloj,
    integrado?.alojamentoDate,
    integrado?.status,
    integrado?.fechamentoDate
  );

  const desvio = Number((realConsumo - expectedConsumo).toFixed(2));
  const isAlert = Math.abs(desvio) > 5;

  return {
    realConsumo,
    expectedConsumo,
    desvio,
    isAlert,
    idade
  };
}
