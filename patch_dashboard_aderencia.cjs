const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const targetLogic = `          mortalidade: mortPct,
          sanidade: sanitIndex,
          aderencia: expected > 0 && realConsumo > 0 ? Math.max(0, 100 - (Math.abs(realConsumo - expected) / expected * 100)) : 100,
          animaisMortos: v.animaisMortos,`;

const replaceLogic = `          mortalidade: mortPct,
          sanidade: sanitIndex,
          aderencia: (() => {
            // Find all visits for this lote
            const loteVisits = filteredVisits.filter(vi => vi.integradoId === v.integradoId);
            let totalAdherence = 0;
            let validPoints = 0;
            
            loteVisits.forEach(vi => {
              const viAge = calculateVisitAge(vi, integrado);
              const viConfig = configs.find(c => c.empresa_id === (integrado?.empresaId));
              const viExpected = getExpectedConsumption(viAge, vi.tipoLote, vi.pesoAloj, integrado?.alojamentoDate, integrado?.status, integrado?.fechamentoDate, viConfig, undefined, vi.date);
              const viReal = calculateRealConsumption(vi);
              
              if (viExpected && viExpected > 0 && viReal > 0) {
                const errorRate = Math.abs(viReal - viExpected) / viExpected;
                totalAdherence += Math.max(0, 100 - (errorRate * 100));
                validPoints++;
              }
            });
            
            return validPoints > 0 ? Math.round(totalAdherence / validPoints) : (expected > 0 && realConsumo > 0 ? Math.max(0, 100 - (Math.abs(realConsumo - expected) / expected * 100)) : 100);
          })(),
          animaisMortos: v.animaisMortos,`;

code = code.replace(targetLogic, replaceLogic);
fs.writeFileSync('src/components/Dashboard.tsx', code);
