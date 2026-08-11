const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

// I will make the PDF format a4 portrait, but I should probably just leave it to automatically size or scale it properly.
const jsPDFcode = `const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);`;

const jsPDFMultiPage = `const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        let position = 0;
        let heightLeft = pdfHeight;
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
        
        while (heightLeft >= 0) {
          position = heightLeft - pdfHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
          heightLeft -= pageHeight;
        }`;

code = code.replace(jsPDFcode, jsPDFMultiPage);

fs.writeFileSync('src/components/Dashboard.tsx', code);
console.log('patched multi-page');
