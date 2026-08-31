import fs from 'fs';

const filePath = 'src/components/Dashboard.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Add ScatterChart to imports
content = content.replace(/BarChart, Bar, Cell, ReferenceArea, LabelList/, "BarChart, Bar, Cell, ReferenceArea, LabelList, ScatterChart, Scatter, ZAxis");

// 2. Add sanitIndex calculation in latestVisitsData mapping
const sanityLogic = `
        const parseScore = (s?: number) => { if(!s) return 0; if(s===1) return 3; if(s===2) return 2; if(s===3) return 1; return 0; };
        const ev = v.avaliacao_tecnica;
        let sanitIndex = 100;
        if (ev) {
          const validScores: {score: number}[] = [];
          if (ev.suinos?.diarreia) validScores.push({score: parseScore(ev.suinos.diarreia)});
          if (ev.suinos?.tosse) validScores.push({score: parseScore(ev.suinos.tosse)});
          if (ev.suinos?.mortalidade) validScores.push({score: parseScore(ev.suinos.mortalidade)});
          if (ev.suinos?.refugos) validScores.push({score: parseScore(ev.suinos.refugos)});
          if (ev.suinos?.canibalismo) validScores.push({score: parseScore(ev.suinos.canibalismo)});
          if (ev.granja?.limpeza_baias) validScores.push({score: parseScore(ev.granja.limpeza_baias)});
          if (ev.granja?.cortinas) validScores.push({score: parseScore(ev.granja.cortinas)});
          if (ev.granja?.qualidade_ar) validScores.push({score: parseScore(ev.granja.qualidade_ar)});
          if (ev.bebedouros?.vazamento) validScores.push({score: parseScore(ev.bebedouros.vazamento)});
          if (ev.bebedouros?.pressao_agua) validScores.push({score: parseScore(ev.bebedouros.pressao_agua)});
          if (ev.comedouros?.regulagem) validScores.push({score: parseScore(ev.comedouros.regulagem)});

          if (validScores.length > 0) {
            const totalMax = validScores.length * 3;
            const currentScore = validScores.reduce((acc, curr) => acc + curr.score, 0);
            sanitIndex = Math.round((currentScore / totalMax) * 100);
          }
        }
`;

content = content.replace(/const mortPct = calculateMortalityRate\(v\);/, `const mortPct = calculateMortalityRate(v);` + sanityLogic);
content = content.replace(/mortalidade: mortPct,/, `mortalidade: mortPct,
          sanidade: sanitIndex,
          aderencia: expected > 0 && realConsumo > 0 ? Math.max(0, 100 - (Math.abs(realConsumo - expected) / expected * 100)) : 100,`);

fs.writeFileSync(filePath, content);
