const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const regex = /const ev = v\.avaliacao_tecnica;\s+let sanitIndex = 100;\s+if \(ev\) \{[\s\S]*?sanitIndex = Math\.round\(\(currentScore \/ totalMax\) \* 100\);\s+\}\s+\}/;

const replaceLogic = `const loteVisitsSanity = visits.filter(vi => vi.integradoId === v.integradoId && vi.avaliacao_tecnica);
        let sanitIndex = 100;
        
        if (loteVisitsSanity.length > 0) {
            const aggregated: Record<string, { total: number, count: number }> = {
                'Limpeza': { total: 0, count: 0 },
                'Desperdício': { total: 0, count: 0 },
                'Ventilação': { total: 0, count: 0 },
                'Tosse': { total: 0, count: 0 },
                'Diarreia': { total: 0, count: 0 },
                'Uniformidade': { total: 0, count: 0 },
                'Canibalismo': { total: 0, count: 0 },
            };
            
            loteVisitsSanity.forEach(vi => {
                const ev = vi.avaliacao_tecnica;
                if (!ev) return;
                
                const scores = {
                    'Limpeza': parseScore(ev.granja?.limpeza_baias),
                    'Desperdício': parseScore(ev.granja?.desperdicio_racao),
                    'Ventilação': parseScore(ev.granja?.ventilacao_cortinas),
                    'Tosse': parseScore(ev.suinos?.tosse),
                    'Diarreia': parseScore(ev.suinos?.diarreia),
                    'Uniformidade': parseScore(ev.suinos?.uniformidade),
                    'Canibalismo': parseScore(ev.suinos?.canibalismo),
                };
                
                Object.entries(scores).forEach(([key, score]) => {
                    if (score > 0) {
                        aggregated[key].total += score;
                        aggregated[key].count += 1;
                    }
                });
            });
            
            const validScores = Object.entries(aggregated).map(([k, d]) => d.count > 0 ? (d.total / d.count) : 0).filter(s => s > 0);
            
            if (validScores.length > 0) {
                const totalMax = validScores.length * 3;
                const currentScore = validScores.reduce((acc, curr) => acc + curr, 0);
                sanitIndex = Math.round((currentScore / totalMax) * 100);
            }
        }`;

if (regex.test(code)) {
    code = code.replace(regex, replaceLogic);
    fs.writeFileSync('src/components/Dashboard.tsx', code);
    console.log("Match found and replaced");
} else {
    console.log("No match found!");
}
