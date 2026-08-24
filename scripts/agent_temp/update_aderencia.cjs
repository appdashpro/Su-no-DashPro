const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src', 'components', 'IntegradoDetailsModal.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace accuracyColorClass logic
const oldColorLogic = `  let accuracyColorClass = 'bg-blue-100 text-blue-700 border-blue-200';
  if (realVisits.length > 0) {
    const lastVisit = realVisits[realVisits.length - 1];
    if (lastVisit.esperado && lastVisit.real !== null && lastVisit.real !== undefined) {
      const finalDiff = lastVisit.real - lastVisit.esperado;
      if (finalDiff > 5) {
        accuracyColorClass = 'bg-red-100 text-red-700 border-red-200';
      } else if (finalDiff < -5) {
        accuracyColorClass = 'bg-emerald-100 text-emerald-700 border-emerald-200';
      }
    }
  }`;

const newColorLogic = `  let accuracyColorClass = 'bg-slate-100 text-slate-700 border-slate-200';
  let accuracyStatus = '';
  
  if (curveAccuracy !== null) {
    if (curveAccuracy >= 95) {
      accuracyColorClass = 'bg-emerald-100 text-emerald-700 border-emerald-200';
      accuracyStatus = 'Excelente';
    } else if (curveAccuracy >= 90) {
      accuracyColorClass = 'bg-amber-100 text-amber-700 border-amber-200';
      accuracyStatus = 'Atenção';
    } else {
      accuracyColorClass = 'bg-red-100 text-red-700 border-red-200';
      accuracyStatus = 'Crítico';
    }
  }`;

content = content.replace(oldColorLogic, newColorLogic);

// Replace card color application
const oldCardValue = `                         <div className={\`text-lg font-bold \${accuracyColorClass.replace('bg-', 'text-').replace('-100', '-600').split(' ')[1] || 'text-slate-800'}\`}>
                           {curveAccuracy !== null ? \`\${curveAccuracy}%\` : '-'}
                         </div>`;
const newCardValue = `                         <div className="flex items-baseline gap-2">
                           <div className={\`text-lg font-bold \${accuracyColorClass.replace('bg-', 'text-').replace('-100', '-600').split(' ')[1] || 'text-slate-800'}\`}>
                             {curveAccuracy !== null ? \`\${curveAccuracy}%\` : '-'}
                           </div>
                           {accuracyStatus && (
                             <span className={\`text-[10px] font-semibold px-1.5 py-0.5 rounded-md \${accuracyColorClass}\`}>
                               {accuracyStatus}
                             </span>
                           )}
                         </div>`;

content = content.replace(oldCardValue, newCardValue);

// Replace modal explanation
const oldModalExplanation = `              <div className="text-xs bg-blue-50 text-blue-800 p-3 rounded border border-blue-100">
                <strong>Nota sobre Cores:</strong> A cor do selo reflete o desvio da <em>última visita</em> (Vermelho {'>'} +5kg, Verde {'<'} -5kg, Azul dentro do limite).
              </div>`;

const newModalExplanation = `              <div className="text-xs bg-slate-50 text-slate-700 p-3 rounded border border-slate-200 space-y-2">
                <p className="font-semibold text-slate-800 border-b border-slate-200 pb-1 mb-2">Critério de Cores e Gravidade (Média do Lote):</p>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0"></span>
                  <p><strong>Excelente (Verde):</strong> Aderência <strong>&ge; 95%</strong>. O lote está consumindo de forma ideal e previsível.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0"></span>
                  <p><strong>Atenção (Amarelo):</strong> Aderência <strong>entre 90% e 94%</strong>. Há desvios moderados (desperdício ou baixo consumo).</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 shrink-0"></span>
                  <p><strong>Crítico (Vermelho):</strong> Aderência <strong>&lt; 90%</strong>. Alerta severo de saúde (baixo consumo) ou desperdício extremo (alto consumo).</p>
                </div>
              </div>`;

content = content.replace(oldModalExplanation, newModalExplanation);

fs.writeFileSync(filePath, content);
console.log('Update complete');
