const fs = require('fs');
const points = JSON.parse(fs.readFileSync('src/new_curve.json', 'utf8'));

// Format budgets
const budgets = [
  { fase: "Alojamento", kgPorAnimal: 16.39 },
  { fase: "Crescimento 1", kgPorAnimal: 22.97 },
  { fase: "Crescimento 2", kgPorAnimal: 29.45 },
  { fase: "Crescimento 3", kgPorAnimal: 34.04 },
  { fase: "Terminação 1", kgPorAnimal: 25.98 },
  { fase: "Terminação 2", kgPorAnimal: 37.46 }
];

const metasJson = {
  pontos: points.map(p => ({
    dia: p.dia,
    consumoEsperadoKg: p.consumoAcumulado, // Note: The app may expect something else, but let's map it based on the types
    pesoEsperadoKg: p.pesoFinal,
    gpdEsperadoG: p.gpd * 1000 // Convert kg to grams if needed, but let's check types.ts
  })),
  budgets: budgets
};

// Wait, looking at types.ts:
// export interface PontoMetaJSON {
//   dia: number;
//   consumoEsperadoKg: number;
//   pesoEsperadoKg?: number;
//   gpdEsperadoG?: number;
// }

const metasJsonString = JSON.stringify(metasJson).replace(/'/g, "''"); // escape single quotes

const sql = `
-- ==============================================================================
-- INJETAR CURVA DE REFERÊNCIA V2 (METAS E BUDGETS) NA CURVA PADRÃO
-- ==============================================================================

UPDATE public.curvas
SET metas_json = '${metasJsonString}'::jsonb
WHERE empresa_id = '00000000-0000-0000-0000-000000000001'
  AND nome = 'Curva Padrão Rações Pastre';
`;

fs.writeFileSync('update_curva.sql', sql);
