const fs = require('fs');
let content = fs.readFileSync('src/components/IntegradoDetailsModal.tsx', 'utf8');

const adherenceLogic = `
  const realVisits = chartData.filter(d => d.real !== null && d.real !== undefined);
  const minReal = realVisits.length > 0 ? realVisits[0].idade : 1;
  const maxReal = realVisits.length > 0 ? realVisits[realVisits.length - 1].idade : 1;

  let totalAdherence = 0;
  let validAdherencePoints = 0;
  
  realVisits.forEach(v => {
    if (v.esperado && v.esperado > 0) {
      const errorRate = Math.abs(v.real - v.esperado) / v.esperado;
      const adherence = Math.max(0, 100 - (errorRate * 100));
      totalAdherence += adherence;
      validAdherencePoints++;
    }
  });

  const curveAccuracy = validAdherencePoints > 0 ? Math.round(totalAdherence / validAdherencePoints) : null;
  
  let accuracyColorClass = 'bg-blue-100 text-blue-700 border-blue-200';
  if (realVisits.length > 0) {
    const lastVisit = realVisits[realVisits.length - 1];
    if (lastVisit.esperado) {
      const finalDiff = lastVisit.real - lastVisit.esperado;
      if (finalDiff > 5) {
        accuracyColorClass = 'bg-red-100 text-red-700 border-red-200';
      } else if (finalDiff < -5) {
        accuracyColorClass = 'bg-emerald-100 text-emerald-700 border-emerald-200';
      }
    }
  }
`;

content = content.replace(/  const realVisits = chartData.filter[\s\S]*?const maxReal = [^;]+;/, adherenceLogic);

const titleSearch = `<h4 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wider">Curva de Consumo do Lote</h4>`;
const titleReplace = `
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-0">Curva de Consumo do Lote</h4>
                  {curveAccuracy !== null && (
                    <div className="flex items-center gap-2" title="Precisão de aderência à meta de consumo">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Aderência:</span>
                      <span className={\`px-2 py-0.5 rounded text-xs font-bold border \${accuracyColorClass}\`}>
                        {curveAccuracy}%
                      </span>
                    </div>
                  )}
                </div>
`;

content = content.replace(titleSearch, titleReplace);

fs.writeFileSync('src/components/IntegradoDetailsModal.tsx', content, 'utf8');
