const fs = require('fs');
const points = JSON.parse(fs.readFileSync('src/new_curve.json', 'utf8'));

// Format budgets (V2 from data.ts)
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
    consumoEsperadoKg: p.consumoAcumulado,
    pesoEsperadoKg: p.pesoFinal,
    gpdEsperadoG: p.gpd * 1000
  })),
  budgets: budgets
};

const metasJsonString = JSON.stringify(metasJson).replace(/'/g, "''");

const sql = `-- ==============================================================================
-- INJETAR CURVA DE REFERÊNCIA V2 (METAS E BUDGETS) NA CURVA PADRÃO
-- ==============================================================================

UPDATE public.curvas
SET metas_json = '${metasJsonString}'::jsonb
WHERE empresa_id = '00000000-0000-0000-0000-000000000001'
  AND nome = 'Curva Padrão Rações Pastre';
`;

fs.writeFileSync('update_curva.sql', sql);
