const fs = require('fs');
let code = fs.readFileSync('src/data.ts', 'utf-8');

code = code.replace(
  "      metaTerminacao2: 70.2,\n      metaAcumulada: 267.29\n    },\n    curve: [",
  "      metaTerminacao2: 70.2,\n      metaAcumulada: 267.29\n    },\n    programa_alimentar: [\n      { racao: 'Alojamento', dia_inicio: 1, dia_fim: 14 },\n      { racao: 'Crescimento 1', dia_inicio: 15, dia_fim: 38 },\n      { racao: 'Crescimento 2', dia_inicio: 39, dia_fim: 52 },\n      { racao: 'Crescimento 3', dia_inicio: 53, dia_fim: 76 },\n      { racao: 'Terminação 1', dia_inicio: 77, dia_fim: 90 },\n      { racao: 'Terminação 2', dia_inicio: 91, dia_fim: 112 }\n    ],\n    curve: ["
);

fs.writeFileSync('src/data.ts', code);
