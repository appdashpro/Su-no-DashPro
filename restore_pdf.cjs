const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

// Add imports
code = code.replace(
    "import { getExpectedConsumption } from '../data';",
    "import { getExpectedConsumption } from '../data';\nimport html2canvas from 'html2canvas-pro';\nimport { jsPDF } from 'jspdf';"
);

// Add isExporting state
code = code.replace(
    "const [isDropdownOpen, setIsDropdownOpen] = useState(false);",
    "const [isDropdownOpen, setIsDropdownOpen] = useState(false);\n  const [isExporting, setIsExporting] = useState(false);"
);

// Add handleExportPDF
const statsCalculation = /const stats = useMemo\(\(\) => \{[\s\S]*?\}, \[latestVisitsData, filteredIntegrados\.length, filteredVisits\]\);/;

const newExportFunc = `
  const handleExportPDF = async () => {
    if (!dashboardRef.current) return;
    setIsExporting(true);
    
    // Give time for state to update and re-render
    setTimeout(async () => {
      try {
        const canvas = await html2canvas(dashboardRef.current, { scale: 2, useCORS: true, logging: false, windowWidth: 1200 });
        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        
        const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        const filename = selectedIntegradoIds.length === 1 ? \`relatorio_\${filteredIntegrados[0]?.name || 'lote'}.pdf\` : 'relatorio_dashboard.pdf';
        pdf.save(filename);
      } catch (e) {
        console.error('Failed to export PDF:', e);
        alert('Erro ao exportar PDF. Tente novamente.');
      } finally {
        setIsExporting(false);
      }
    }, 300);
  };
`;

code = code.replace(statsCalculation, (match) => match + newExportFunc);

// Re-add button
const uiSection = `<div className="flex flex-col md:flex-row justify-end items-start md:items-center gap-3">`;
const uiSectionWithButton = `{!isExporting && (
      <div className="flex flex-col md:flex-row justify-end items-start md:items-center gap-3">
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          {selectedIntegradoIds.length === 1 && (
            <button
              onClick={handleExportPDF}
              className="flex items-center justify-center gap-2 text-sm text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg shadow-sm w-full md:w-auto font-medium transition-colors"
            >
              <FileDown className="w-4 h-4" />
              Gerar PDF
            </button>
          )}`;

code = code.replace(
    `<div className="flex flex-col md:flex-row justify-end items-start md:items-center gap-3">
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">`,
    uiSectionWithButton
);

code = code.replace('{/* KPI Cards */}', ')}\n      {/* KPI Cards */}');

// Add table
const endOfDiv = '</div>\n  );\n}';
const exportTable = `
      {isExporting && selectedIntegradoIds.length === 1 && (
        <div className="mt-8 bg-white p-6 rounded-xl border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Relatório de Visitas: {filteredIntegrados[0]?.name}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-700">Data</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Idade (dias)</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Consumo Acum. (kg)</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Meta Acum. (kg)</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Diferença (kg)</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Animais Aloj.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVisits.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((v) => {
                  const dif = v.consumoAcumuladoReal ? v.consumoAcumuladoReal - (v.metaAcumulada || 0) : 0;
                  return (
                    <tr key={v.id}>
                      <td className="px-4 py-3 text-slate-700">{v.date.split('-').reverse().join('/')}</td>
                      <td className="px-4 py-3 text-slate-700">{v.idade}</td>
                      <td className="px-4 py-3 text-slate-700">{v.consumoAcumuladoReal}</td>
                      <td className="px-4 py-3 text-slate-700">{v.metaAcumulada?.toFixed(2)}</td>
                      <td className={\`px-4 py-3 font-medium \${dif > 0 ? 'text-red-600' : dif < 0 ? 'text-emerald-600' : 'text-slate-700'}\`}>
                        {dif > 0 ? '+' : ''}{dif.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{v.animaisAlojados}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
`;

code = code.replace(endOfDiv, exportTable + endOfDiv);

fs.writeFileSync('src/components/Dashboard.tsx', code);
console.log('Restored PDF export button and logic');
