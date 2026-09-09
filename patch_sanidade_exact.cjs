const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const targetLogic = `        const loteVisitsSanity = filteredVisits.filter(vi => vi.integradoId === v.integradoId && vi.avaliacao_tecnica);
        let sanitIndex = 100;
        
        if (loteVisitsSanity.length > 0) {
            const aggregated: Record<string, { total: number, count: number }> = {
                'diarreia': { total: 0, count: 0 },
                'tosse': { total: 0, count: 0 },
                'uniformidade': { total: 0, count: 0 },
                'canibalismo': { total: 0, count: 0 },
                'prolapso': { total: 0, count: 0 },
                'limpeza_baias': { total: 0, count: 0 },
                'desperdicio_racao': { total: 0, count: 0 },
                'ventilacao_cortinas': { total: 0, count: 0 },
                'ficha_lote': { total: 0, count: 0 },
            };
            
            loteVisitsSanity.forEach(vi => {
                const ev = vi.avaliacao_tecnica;
                if (!ev) return;
                
                const scores = {
                    'diarreia': parseScore(ev.suinos?.diarreia),
                    'tosse': parseScore(ev.suinos?.tosse),
                    'uniformidade': parseScore(ev.suinos?.uniformidade),
                    'canibalismo': parseScore(ev.suinos?.canibalismo),
                    'prolapso': parseScore(ev.suinos?.prolapso),
                    'limpeza_baias': parseScore(ev.granja?.limpeza_baias),
                    'desperdicio_racao': parseScore(ev.granja?.desperdicio_racao),
                    'ventilacao_cortinas': parseScore(ev.granja?.ventilacao_cortinas),
                    'ficha_lote': parseScore(ev.granja?.ficha_lote),
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

const replaceLogic = `        const loteVisitsSanity = filteredVisits.filter(vi => vi.integradoId === v.integradoId && vi.avaliacao_tecnica);
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

code = code.replace(targetLogic, replaceLogic);
fs.writeFileSync('src/components/Dashboard.tsx', code);
