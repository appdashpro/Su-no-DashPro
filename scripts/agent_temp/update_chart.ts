import fs from 'fs';

const filePath = 'src/components/VisitForm.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const regex = /<ResponsiveContainer width="100%" height="100%">[\s\S]*?<\/ResponsiveContainer>/;

const replacement = `<ResponsiveContainer width="100%" height="100%">
      <LineChart data={dynamicChartData} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="dia" type="number" domain={['dataMin', 'dataMax']} label={{ value: 'Idade (Dias)', position: 'bottom', offset: 0 }} stroke="#64748b" fontSize={12} />
        <YAxis label={{ value: 'Consumo (kg)', angle: -90, position: 'insideLeft', offset: 15 }} stroke="#64748b" fontSize={12} />
        <Tooltip 
          cursor={{ stroke: '#cbd5e1' }} 
          content={({ active, payload, label }: any) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              const isCurrentAge = label === currentIdade;
              const realConsumo = (isCurrentAge && formData.consumoAcumuladoReal !== undefined && String(formData.consumoAcumuladoReal) !== '') 
                ? Number(formData.consumoAcumuladoReal) 
                : undefined;
              
              let realDiff = null;
              let colorClass = "text-slate-700";
              if (realConsumo !== undefined) {
                realDiff = realConsumo - data.consumoAcumulado;
                if (Math.abs(realDiff) <= 5) colorClass = "text-blue-600";
                else if (realDiff < -5) colorClass = "text-emerald-600";
                else colorClass = "text-red-600";
              }

              return (
                <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-md text-sm">
                  <p className="font-bold text-slate-700 mb-2">Idade: {label} dias</p>
                  <p className="text-slate-600">Consumo Meta: <span className="font-semibold text-slate-900">{data.consumoAcumulado.toFixed(2)} kg</span></p>
                  
                  {isCurrentAge && realConsumo !== undefined && (
                    <>
                      <div className="my-2 border-t border-slate-100"></div>
                      <p className="text-slate-600">Consumo Real: <span className="font-semibold text-slate-900">{realConsumo.toFixed(2)} kg</span></p>
                      <p className={colorClass + " font-medium mt-1"}>
                        Fuga da Meta: {realDiff! > 0 ? '+' : ''}{realDiff!.toFixed(2)} kg
                      </p>
                    </>
                  )}
                </div>
              );
            }
            return null;
          }}
        />
        <Line type="monotone" dataKey="consumoAcumulado" stroke="#3b82f6" strokeWidth={3} dot={{ r: 0 }} activeDot={{ r: 4 }} name="Esperado" />
        {formData.consumoAcumuladoReal !== undefined && String(formData.consumoAcumuladoReal) !== '' && (
          <ReferenceDot 
            x={currentIdade} 
            y={Number(formData.consumoAcumuladoReal)} 
            r={6} 
            fill={(currentDiffKg !== null && Math.abs(currentDiffKg) <= 5) ? "#3b82f6" : (currentDiffKg !== null && currentDiffKg < -5) ? "#10b981" : "#ef4444"} 
            stroke="white" 
            strokeWidth={2}
          />
        )}
      </LineChart>
    </ResponsiveContainer>`;

content = content.replace(regex, replacement);
fs.writeFileSync(filePath, content);
