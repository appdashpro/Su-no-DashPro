const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

// Add state
code = code.replace(
  "const [isDropdownOpen, setIsDropdownOpen] = useState(false);",
  "const [isDropdownOpen, setIsDropdownOpen] = useState(false);\n  const [isExporting, setIsExporting] = useState(false);"
);

// Modify handleExportPDF
const oldExport = `const handleExportPDF = async () => {
    if (!dashboardRef.current) return;
    
    try {
      const canvas = await html2canvas(dashboardRef.current, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      
      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      const filename = selectedIntegradoIds.length === 1 ? \`relatorio_\${filteredIntegrados[0]?.name || 'lote'}.pdf\` : 'relatorio_dashboard.pdf';
      pdf.save(filename);
    } catch (e) {
      console.error('Failed to export PDF:', e);
      alert('Erro ao exportar PDF. Tente novamente.');
    }
  };`;

const newExport = `const handleExportPDF = async () => {
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
  };`;
code = code.replace(oldExport, newExport);

// Hide UI elements during export
code = code.replace(
  '<div className="flex flex-col md:flex-row justify-end items-start md:items-center gap-3">',
  '{!isExporting && (\n      <div className="flex flex-col md:flex-row justify-end items-start md:items-center gap-3">'
);

code = code.replace(
  '{/* KPI Cards */}',
  ')}\n      {/* KPI Cards */}'
);

fs.writeFileSync('src/components/Dashboard.tsx', code);
console.log('patched isExporting state and UI hiding');
