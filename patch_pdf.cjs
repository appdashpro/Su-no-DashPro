const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

code = code.replace("import html2pdf from 'html2pdf.js';", "import html2canvas from 'html2canvas-pro';\nimport { jsPDF } from 'jspdf';");

const oldExport = `  const handleExportPDF = () => {
    if (!dashboardRef.current) return;
    const opt = {
      margin: 10,
      filename: selectedIntegradoIds.length === 1 ? \`relatorio_\${filteredIntegrados[0]?.name || 'lote'}.pdf\` : 'relatorio_dashboard.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };
    html2pdf().set(opt).from(dashboardRef.current).save();
  };`;

const newExport = `  const handleExportPDF = async () => {
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

code = code.replace(oldExport, newExport);

fs.writeFileSync('src/components/Dashboard.tsx', code);
console.log('patched dashboard export');
