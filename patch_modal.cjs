const fs = require('fs');
let content = fs.readFileSync('src/components/IntegradoDetailsModal.tsx', 'utf8');

if (!content.includes('recharts')) {
    content = content.replace("import { AnimatePresence, motion } from 'motion/react';", 
    "import { AnimatePresence, motion } from 'motion/react';\nimport { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';");
}

if (!content.includes('getActiveCurve')) {
    content = content.replace("import { getExpectedConsumption } from '../data';",
    "import { getExpectedConsumption, getActiveCurve } from '../data';");
}

const chartLogic = `
  const lote = integrados.find(i => i.id === integradoId);
  const loteVisits = visits.filter(v => v.integradoId === integradoId).sort((a, b) => (a.idade || 0) - (b.idade || 0));
  
  const maxIdade = Math.max(105, ...(loteVisits.map(v => v.idade || 0)));
  const chartData = [];
  for (let d = 1; d <= maxIdade; d++) {
     const visit = loteVisits.find(v => v.idade === d);
     const esperado = getExpectedConsumption(d, loteVisits[0]?.tipoLote, loteVisits[0]?.pesoAloj, lote?.alojamentoDate, lote?.status, lote?.fechamentoDate);
     // Sample every 5 days or if there's a visit
     if (d === 1 || d % 5 === 0 || visit || d === maxIdade) {
         chartData.push({
            idade: d,
            esperado: esperado ? Number(esperado.toFixed(2)) : null,
            real: (visit && visit.consumoAcumuladoReal) ? Number(visit.consumoAcumuladoReal) : undefined
         });
     }
  }
`;

const chartJSX = `
              <div className="mt-8 mb-4 border-t border-slate-100 pt-6">
                <h4 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wider">Curva de Consumo do Lote</h4>
                <div className="h-64 w-full bg-white border border-slate-200 rounded-lg p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="idade" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                        labelStyle={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}
                        formatter={(value) => [\`\${value} kg\`, '']}
                        labelFormatter={(label) => \`Idade: \${label} dias\`}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Line type="monotone" dataKey="esperado" name="Consumo Esperado" stroke="#94a3b8" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                      <Line type="monotone" dataKey="real" name="Consumo Real" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} connectNulls={true} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
`;

// Insert chartLogic inside component
content = content.replace("const selectedIntegradoDetails = integradoId;", "const selectedIntegradoDetails = integradoId;\n" + chartLogic);

// Insert chartJSX before closing div of modal body
const lastDivIndex = content.lastIndexOf('</div>');
const secondLastDivIndex = content.lastIndexOf('</div>', lastDivIndex - 1);
const thirdLastDivIndex = content.lastIndexOf('</div>', secondLastDivIndex - 1);
content = content.substring(0, thirdLastDivIndex) + chartJSX + content.substring(thirdLastDivIndex);

fs.writeFileSync('src/components/IntegradoDetailsModal.tsx', content, 'utf8');
