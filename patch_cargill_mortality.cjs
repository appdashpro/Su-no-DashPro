const fs = require('fs');
let code = fs.readFileSync('src/utils/cargill-calculations.ts', 'utf8');

const targetLogic = `export function calculateMortalityRate(visit: Partial<Visit>): number {
  const alojados = Number(visit.animaisAlojados) || 0;
  const mortos = Number(visit.animaisMortos);

  if (alojados > 0 && !isNaN(mortos) && mortos >= 0) {
    return Number(((mortos / alojados) * 100).toFixed(2));
  }`;

const replaceLogic = `export function calculateMortalityRate(visit: Partial<Visit>, allVisits: Partial<Visit>[] = []): number {
  const alojados = Number(visit.animaisAlojados) || 0;
  const mortos = Number(visit.animaisMortos);
  
  // Calculate historical descartes for this visit's lote up to this visit's date
  const totalDescartes = allVisits
      .filter(v => v.integradoId === visit.integradoId && new Date(v.date || '').getTime() <= new Date(visit.date || '').getTime())
      .reduce((acc, v) => acc + (Number(v.descartesPeriodo) || 0), 0);

  if (alojados > 0 && !isNaN(mortos) && mortos >= 0) {
    return Number((((mortos + totalDescartes) / alojados) * 100).toFixed(2));
  }`;

code = code.replace(targetLogic, replaceLogic);
fs.writeFileSync('src/utils/cargill-calculations.ts', code);
