import fs from 'fs';

let code = fs.readFileSync('src/components/MedicationAnalysis.tsx', 'utf8');

// Add imports
if (!code.includes("import * as XLSX")) {
  code = code.replace(
    "import { ptBR } from 'date-fns/locale';",
    "import { ptBR } from 'date-fns/locale';\nimport * as XLSX from 'xlsx';"
  );
}
if (!code.includes("Download")) {
  code = code.replace(
    "Search, Pill, Calendar } from 'lucide-react';",
    "Search, Pill, Calendar, Download } from 'lucide-react';"
  );
}

// Add export function
const exportFunc = `
  const handleExport = () => {
    const exportData = periodFilteredData.map(t => ({
      'Data': format(new Date(t.visitDate), "dd/MM/yyyy"),
      'Produtor (Lote)': t.integradoNome,
      'Produto': t.produto,
      'Motivo': t.motivo,
      'Concentração (%)': t.concentracao,
      'Dose (mg/kg)': t.doseMgKg,
      'Duração (Dias)': t.duracaoDias,
      'Animais Tratados': t.animaisTratados,
      'Massa Corporal Est. (kg)': t.pesoEstimadoKg,
      'Consumo Produto (kg/L)': Number(t.produtoConsumidoKg.toFixed(2))
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Consumo_Medicamentos");
    XLSX.writeFile(wb, \`Consumo_Medicamentos_\${format(new Date(), 'yyyy-MM-dd')}.xlsx\`);
  };

  const filteredData = periodFilteredData.filter(t => 
`;

if (!code.includes("const handleExport = () => {")) {
  code = code.replace(
    "  const filteredData = periodFilteredData.filter(t => ",
    exportFunc
  );
}

// Add button to header
const headerDiv = `
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar</span>
          </button>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-1">
`;

if (!code.includes("onClick={handleExport}")) {
  code = code.replace(
    '<div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-1">',
    headerDiv
  );
}

fs.writeFileSync('src/components/MedicationAnalysis.tsx', code);
console.log("Patched MedicationAnalysis.tsx");
