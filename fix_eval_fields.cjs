const fs = require('fs');

function patchFile(filename) {
    let code = fs.readFileSync(filename, 'utf8');
    const search = `          if (ev.suinos?.diarreia) validScores.push({score: parseScore(ev.suinos.diarreia)});
          if (ev.suinos?.tosse) validScores.push({score: parseScore(ev.suinos.tosse)});
          if (ev.suinos?.mortalidade) validScores.push({score: parseScore(ev.suinos.mortalidade)});
          if (ev.suinos?.refugos) validScores.push({score: parseScore(ev.suinos.refugos)});
          if (ev.suinos?.canibalismo) validScores.push({score: parseScore(ev.suinos.canibalismo)});
          if (ev.granja?.limpeza_baias) validScores.push({score: parseScore(ev.granja.limpeza_baias)});
          if (ev.granja?.cortinas) validScores.push({score: parseScore(ev.granja.cortinas)});
          if (ev.granja?.qualidade_ar) validScores.push({score: parseScore(ev.granja.qualidade_ar)});
          if (ev.bebedouros?.vazamento) validScores.push({score: parseScore(ev.bebedouros.vazamento)});
          if (ev.bebedouros?.pressao_agua) validScores.push({score: parseScore(ev.bebedouros.pressao_agua)});
          if (ev.comedouros?.regulagem) validScores.push({score: parseScore(ev.comedouros.regulagem)});`;

    const replacement = `          if (ev.suinos?.diarreia) validScores.push({score: parseScore(ev.suinos.diarreia)});
          if (ev.suinos?.tosse) validScores.push({score: parseScore(ev.suinos.tosse)});
          if (ev.suinos?.uniformidade) validScores.push({score: parseScore(ev.suinos.uniformidade)});
          if (ev.suinos?.canibalismo) validScores.push({score: parseScore(ev.suinos.canibalismo)});
          if (ev.suinos?.prolapso) validScores.push({score: parseScore(ev.suinos.prolapso)});
          if (ev.granja?.limpeza_baias) validScores.push({score: parseScore(ev.granja.limpeza_baias)});
          if (ev.granja?.desperdicio_racao) validScores.push({score: parseScore(ev.granja.desperdicio_racao)});
          if (ev.granja?.ventilacao_cortinas) validScores.push({score: parseScore(ev.granja.ventilacao_cortinas)});
          if (ev.granja?.ficha_lote) validScores.push({score: parseScore(ev.granja.ficha_lote)});`;

    if (code.includes('ev.suinos?.mortalidade')) {
        code = code.replace(search, replacement);
        fs.writeFileSync(filename, code);
        console.log('Fixed ' + filename);
    }
}

patchFile('src/components/Dashboard.tsx');
patchFile('src/reports/templates/ConsolidatedVisitsReport.ts');
