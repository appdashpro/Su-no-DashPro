import fs from 'fs';
let content = fs.readFileSync('src/reports/templates/ConsolidatedLotesReport.ts', 'utf-8');

const regex = /if \(evalSanitaria\) \{[\s\S]*?healthIndex = Math.round\(\(scoreSum \/ totalMax\) \* 100\);\n      \}/g;

const replacement = `if (evalSanitaria) {
        if (parseScore(evalSanitaria.granja?.limpeza_baias) > 0) validScores.push({ score: parseScore(evalSanitaria.granja?.limpeza_baias) });
        if (parseScore(evalSanitaria.granja?.desperdicio_racao) > 0) validScores.push({ score: parseScore(evalSanitaria.granja?.desperdicio_racao) });
        if (parseScore(evalSanitaria.granja?.ventilacao_cortinas) > 0) validScores.push({ score: parseScore(evalSanitaria.granja?.ventilacao_cortinas) });
        if (parseScore(evalSanitaria.suinos?.tosse) > 0) validScores.push({ score: parseScore(evalSanitaria.suinos?.tosse) });
        if (parseScore(evalSanitaria.suinos?.diarreia) > 0) validScores.push({ score: parseScore(evalSanitaria.suinos?.diarreia) });
        if (parseScore(evalSanitaria.suinos?.uniformidade) > 0) validScores.push({ score: parseScore(evalSanitaria.suinos?.uniformidade) });
        if (parseScore(evalSanitaria.suinos?.canibalismo) > 0) validScores.push({ score: parseScore(evalSanitaria.suinos?.canibalismo) });
      }

      let healthIndex = 0;
      if (validScores.length > 0) {
        const totalMax = validScores.length * 3;
        const scoreSum = validScores.reduce((sum, d) => sum + (d.score), 0);
        healthIndex = Math.round((scoreSum / totalMax) * 100);
      }`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/reports/templates/ConsolidatedLotesReport.ts', content);
