const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src', 'components', 'LoteReportModal.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add phase milestones logic
const phaseLogic = `
  const activeCurveInfo = getActiveCurve(lote?.alojamentoDate, lote?.status, loteVisits[0]?.tipoLote, lote?.fechamentoDate, undefined, loteVisits[0]?.curva_consumo_id, loteVisits[0]?.date) || {};
  const metas = activeCurveInfo?.metas;
  const phaseMilestones = [];
  if (metas) {
    let accum = 0;
    const phaseDefs = [
       { key: 'metaAlojamento', label: 'Aloj.' },
       { key: 'metaCrescimento1', label: 'Cr. 1' },
       { key: 'metaCrescimento2', label: 'Cr. 2' },
       { key: 'metaCrescimento3', label: 'Cr. 3' },
       { key: 'metaTerminacao1', label: 'Te. 1' },
       { key: 'metaTerminacao2', label: 'Te. 2' }
    ];
    let phaseIdx = 0;
    accum += metas[phaseDefs[phaseIdx].key] || 0;
    for (let i = 0; i < chartData.length; i++) {
      if (phaseIdx >= phaseDefs.length) break;
      if (chartData[i].esperado !== null && chartData[i].esperado >= accum) {
         phaseMilestones.push({
            idade: chartData[i].idade,
            label: phaseDefs[phaseIdx].label
         });
         phaseIdx++;
         if (phaseIdx < phaseDefs.length) {
            accum += metas[phaseDefs[phaseIdx].key] || 0;
         }
      }
    }
  }

  const realVisits = chartData.filter(d => d.real !== null && d.real !== undefined);`;

content = content.replace("  const realVisits = chartData.filter(d => d.real !== null && d.real !== undefined);", phaseLogic);

// Add Defs for gradient
const defs = `<defs>
                        <linearGradient id="colorRealRep" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>`;

const chartUpdate = `<ComposedChart data={chartData} margin={{ top: 20, right: 0, left: -25, bottom: 0 }}>
                      ${defs}
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      {phaseMilestones.map((pm, i) => (
                        <ReferenceLine key={i} x={pm.idade} stroke="#cbd5e1" strokeDasharray="3 3">
                           <Label value={pm.label} position="insideTopRight" offset={10} fill="#94a3b8" fontSize={9} />
                        </ReferenceLine>
                      ))}
                      <XAxis dataKey="idade" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} minTickGap={20} />
                      <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                      <Area type="monotone" dataKey="real" stroke="none" fill="url(#colorRealRep)" fillOpacity={1} connectNulls={true} isAnimationActive={false} />
                      <Line type="monotone" dataKey="esperado" stroke="#94a3b8" strokeWidth={1.5} dot={false} strokeDasharray="4 4" isAnimationActive={false} />
                      <Line type="monotone" dataKey="real" stroke="#3b82f6" strokeWidth={2} dot={false} connectNulls={true} isAnimationActive={false} />
                    </ComposedChart>`;

const oldChart = `<ComposedChart data={chartData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="idade" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} minTickGap={20} />
                      <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                      <Area type="monotone" dataKey="real" stroke="none" fill="#3b82f6" fillOpacity={0.1} isAnimationActive={false} />
                      <Line type="monotone" dataKey="esperado" stroke="#94a3b8" strokeWidth={1.5} dot={false} strokeDasharray="4 4" isAnimationActive={false} />
                      <Line type="monotone" dataKey="real" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
                    </ComposedChart>`;

content = content.replace(oldChart, chartUpdate);

// Limit tratamentos to last 4
const tratamentosRegex = /loteVisits\.filter\(v => v\.tratamentos && v\.tratamentos\.length > 0\)\.map/g;
content = content.replace(tratamentosRegex, "loteVisits.filter(v => v.tratamentos && v.tratamentos.length > 0).slice(-4).map");

fs.writeFileSync(filePath, content);
console.log('Update complete LoteReportModal');
