const fs = require('fs');
const path = './src/components/Dashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
`      // Calculate expected consumption using reactive Cargill curve utilities
      const expected = getExpectedConsumption(
        idade, 
        dominantTipoLote, 
        avgPesoAloj, 
        singleAlojamentoDate, 
        singleStatus, 
        singleFechamentoDate
      );`,
`      // Calculate expected consumption using reactive Cargill curve utilities
      const sampleVisit = visitsAtAge[0];
      const expected = getExpectedConsumption(
        idade, 
        dominantTipoLote, 
        avgPesoAloj, 
        singleAlojamentoDate, 
        singleStatus, 
        singleFechamentoDate,
        undefined,
        undefined,
        sampleVisit?.date
      );`
);

content = content.replace(
`        const expected = getExpectedConsumption(
          age,
          v.tipoLote,
          v.pesoAloj,
          integrado?.alojamentoDate,
          integrado?.status,
          integrado?.fechamentoDate
        );`,
`        const expected = getExpectedConsumption(
          age,
          v.tipoLote,
          v.pesoAloj,
          integrado?.alojamentoDate,
          integrado?.status,
          integrado?.fechamentoDate,
          undefined,
          undefined,
          v.date
        );`
);

content = content.replace(
  "const expected = getExpectedConsumption(age, v.tipoLote, v.pesoAloj, singleIntegrado?.alojamentoDate, singleIntegrado?.status, singleIntegrado?.fechamentoDate, currentConfig);",
  "const expected = getExpectedConsumption(age, v.tipoLote, v.pesoAloj, singleIntegrado?.alojamentoDate, singleIntegrado?.status, singleIntegrado?.fechamentoDate, currentConfig, undefined, v.date);"
);

fs.writeFileSync(path, content);
