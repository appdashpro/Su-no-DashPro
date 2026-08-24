const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src', 'components', 'LoteReportModal.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update the handleDownload logic
const oldDownload = `  const handleDownload = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(\`Relatorio_Fechamento_\${lote?.name.replace(/\\s+/g, '_')}.pdf\`);
    } catch (err) {
      console.error(err);
      alert('Erro ao gerar PDF.');
    } finally {
      setIsGenerating(false);
    }
  };`;

const newDownload = `  const handleDownload = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(\`Relatorio_\${lote?.name.replace(/\\s+/g, '_')}.pdf\`);
    } catch (err) {
      console.error(err);
      alert('Erro ao gerar PDF.');
    } finally {
      setIsGenerating(false);
    }
  };`;

content = content.replace(oldDownload, newDownload);

// 2. Remove the .slice(-4) from treatments mapping
// Let's find it. Wait, in my previous patching I might have changed it to .slice(-4)
content = content.replace(/\.slice\(-4\)\.map/g, ".map");
content = content.replace(/\.slice\(-4\)\.reverse\(\)\.map/g, ".reverse().map"); // For recommendations it was slice(-4).reverse()

// 3. Make sure the container expands naturally. 
content = content.replace("style={{ width: '794px', minHeight: '1123px', padding: '40px', boxSizing: 'border-box' }}", "style={{ width: '794px', minHeight: '1123px', height: 'fit-content', padding: '40px', boxSizing: 'border-box' }}");

fs.writeFileSync(filePath, content);
console.log('Update complete LoteReportModal pagination');
