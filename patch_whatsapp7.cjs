const fs = require('fs');
let code = fs.readFileSync('src/lib/whatsapp.ts', 'utf8');

const targetIndexBlock = `      const scores = [
        parseScore(granja?.limpeza_baias),
        parseScore(granja?.desperdicio_racao),
        parseScore(granja?.ventilacao_cortinas),
        parseScore(granja?.ficha_lote),
        parseScore(suinos?.tosse),
        parseScore(suinos?.diarreia),
        parseScore(suinos?.uniformidade),
        parseScore(suinos?.canibalismo),
        parseScore(suinos?.prolapso),
        parseScore(suinos?.parecer_medicacao)
      ];`;

const replacementIndexBlock = `      const scores = [
        parseScore(granja?.limpeza_baias),
        parseScore(granja?.desperdicio_racao),
        parseScore(granja?.ventilacao_cortinas),
        parseScore(suinos?.tosse),
        parseScore(suinos?.diarreia),
        parseScore(suinos?.uniformidade),
        parseScore(suinos?.canibalismo)
      ];`;

code = code.replace(targetIndexBlock, replacementIndexBlock);

fs.writeFileSync('src/lib/whatsapp.ts', code);
