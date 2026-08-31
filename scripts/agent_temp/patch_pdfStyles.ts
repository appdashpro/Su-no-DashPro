import fs from 'fs';

let content = fs.readFileSync('src/reports/pdfStyles.ts', 'utf-8');

content = content.replace(/subheader: \{[\s\S]*?\},/, "subheader: { fontSize: 10, bold: true, color: '#64748b', margin: [0, 0, 0, 10] },");
content = content.replace(/sectionTitle: \{[\s\S]*?\},/, "sectionTitle: { fontSize: 11, bold: true, color: '#0f172a', margin: [0, 15, 0, 8] },");
content = content.replace(/tableHeader: \{[\s\S]*?\},/, "tableHeader: { bold: true, fontSize: 9, color: '#475569', fillColor: '#f1f5f9', margin: [4, 4, 4, 4] },");
content = content.replace(/tableCell: \{[\s\S]*?\},/, "tableCell: { fontSize: 9, color: '#334155', margin: [4, 4, 4, 4] },");
content = content.replace(/metricCardValue: \{[\s\S]*?\},/, "metricCardValue: { fontSize: 16, bold: true, color: '#0f172a', alignment: 'center', margin: [0, 4, 0, 2] },");
content = content.replace(/paddingLeft: \(\) => 6,/g, "paddingLeft: () => 4,");
content = content.replace(/paddingRight: \(\) => 6,/g, "paddingRight: () => 4,");
content = content.replace(/paddingTop: \(\) => 6,/g, "paddingTop: () => 4,");
content = content.replace(/paddingBottom: \(\) => 6,/g, "paddingBottom: () => 4,");

fs.writeFileSync('src/reports/pdfStyles.ts', content);
