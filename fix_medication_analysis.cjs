const fs = require('fs');
let code = fs.readFileSync('src/components/MedicationAnalysis.tsx', 'utf8');

if (!code.includes("viewMode === 'custo'")) {
  code = code.replace(
    "const [selectedPeriod, setSelectedPeriod] = useState(30);",
    "const [selectedPeriod, setSelectedPeriod] = useState(30);\n  const [viewMode, setViewMode] = useState<'volume' | 'custo'>('volume');"
  );
  
  // Need to extract custoTotal from visitas and store in FlatTreatment
  code = code.replace(
    "animaisTratados: v.animaisAlojados || 0",
    "animaisTratados: v.animaisAlojados || 0,\n              custoTotal: t.custoTotal || 0"
  );

  code = code.replace(
    "animaisTratados: number;",
    "animaisTratados: number;\n  custoTotal: number;"
  );

  code = code.replace(
    "const val = acc[key][t.produto] || 0;\n      acc[key][t.produto] = val + t.produtoConsumidoKg;",
    "const val = acc[key][t.produto] || 0;\n      acc[key][t.produto] = val + (viewMode === 'custo' ? t.custoTotal : t.produtoConsumidoKg);"
  );

  code = code.replace(
    "const totalKg = periodFilteredData.reduce((acc, t) => acc + t.produtoConsumidoKg, 0);",
    "const totalKg = periodFilteredData.reduce((acc, t) => acc + (viewMode === 'custo' ? t.custoTotal : t.produtoConsumidoKg), 0);"
  );

  code = code.replace(
    "acc[t.produto] = (acc[t.produto] || 0) + t.produtoConsumidoKg;",
    "acc[t.produto] = (acc[t.produto] || 0) + (viewMode === 'custo' ? t.custoTotal : t.produtoConsumidoKg);"
  );

  code = code.replace(
    "acc[t.motivo] = (acc[t.motivo] || 0) + t.produtoConsumidoKg;",
    "acc[t.motivo] = (acc[t.motivo] || 0) + (viewMode === 'custo' ? t.custoTotal : t.produtoConsumidoKg);"
  );

  code = code.replace(
    "acc[t.integradoNome].kg += t.produtoConsumidoKg;",
    "acc[t.integradoNome].kg += (viewMode === 'custo' ? t.custoTotal : t.produtoConsumidoKg);"
  );

  const toggleUI = `
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Análise de Medicamentos</h2>
          <p className="text-sm text-slate-500">Acompanhamento do consumo de medicamentos no campo</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setViewMode('volume')}
              className={\`px-4 py-1.5 text-sm font-medium rounded-md transition-colors \${viewMode === 'volume' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-600 hover:text-slate-900'}\`}
            >
              Volume (Kg)
            </button>
            <button 
              onClick={() => setViewMode('custo')}
              className={\`px-4 py-1.5 text-sm font-medium rounded-md transition-colors \${viewMode === 'custo' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-600 hover:text-slate-900'}\`}
            >
              Custo (R$)
            </button>
          </div>
          <select`;

  code = code.replace(
    /<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">\s*<div>\s*<h2 className="text-xl font-bold text-slate-800">Análise de Medicamentos<\/h2>\s*<p className="text-sm text-slate-500">Acompanhamento do consumo de medicamentos no campo<\/p>\s*<\/div>\s*<select/s,
    toggleUI
  );
  
  // Formatters
  code = code.replace(
    "formatter={(value) => `${Number(value).toFixed(2)} kg`}",
    "formatter={(value) => viewMode === 'custo' ? `R$ ${Number(value).toFixed(2)}` : `${Number(value).toFixed(2)} kg`}"
  );
  code = code.replace(
    "tickFormatter={(value) => `${value}kg`}",
    "tickFormatter={(value) => viewMode === 'custo' ? `R$${value}` : `${value}kg`}"
  );
  code = code.replace(
    "className=\"text-2xl font-bold text-slate-800\">{totalKg.toFixed(2)} kg</p>",
    "className=\"text-2xl font-bold text-slate-800\">{viewMode === 'custo' ? 'R$ ' : ''}{totalKg.toFixed(2)}{viewMode === 'volume' ? ' kg' : ''}</p>"
  );

  code = code.replace(
    "{kg.toFixed(2)} kg",
    "{viewMode === 'custo' ? 'R$ ' + kg.toFixed(2) : kg.toFixed(2) + ' kg'}"
  );
  code = code.replace(
    "{kg.toFixed(2)} kg",
    "{viewMode === 'custo' ? 'R$ ' + kg.toFixed(2) : kg.toFixed(2) + ' kg'}"
  );
  code = code.replace(
    "<div>{data.kg.toFixed(2)} kg</div>",
    "<div>{viewMode === 'custo' ? 'R$ ' + data.kg.toFixed(2) : data.kg.toFixed(2) + ' kg'}</div>"
  );
  
  // Also fix the unit text where it says "Kg/1000 cab" etc
  code = code.replace(
    "const kgPer1000 = (data.kg / data.animais) * 1000;",
    "const kgPer1000 = (data.kg / data.animais) * 1000;"
  );
  
  code = code.replace(
    "<div>{kgPer1000.toFixed(2)} kg / 1000 cab</div>",
    "<div>{viewMode === 'custo' ? 'R$ ' : ''}{kgPer1000.toFixed(2)}{viewMode === 'volume' ? ' kg' : ''} / 1000 cab</div>"
  );


  fs.writeFileSync('src/components/MedicationAnalysis.tsx', code);
  console.log('MedicationAnalysis.tsx updated for viewMode');
} else {
  console.log('MedicationAnalysis.tsx already updated');
}
