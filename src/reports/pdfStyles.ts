import { StyleDictionary } from 'pdfmake/interfaces';

export const pdfStyles: StyleDictionary = {
  header: { fontSize: 22, bold: true, margin: [0, 0, 0, 4], color: '#0f172a' },
  subheader: { fontSize: 10, bold: true, color: '#64748b', margin: [0, 0, 0, 10] },
  sectionTitle: { fontSize: 11, bold: true, color: '#0f172a', margin: [0, 15, 0, 8] },
  tableHeader: { bold: true, fontSize: 9, color: '#475569', fillColor: '#f1f5f9', margin: [4, 4, 4, 4] },
  tableCell: { fontSize: 9, color: '#334155', margin: [4, 4, 4, 4] },
  text: { fontSize: 10, color: '#334155', lineHeight: 1.4 },
  label: { fontSize: 9, bold: true, color: '#64748b' },
  metricCardTitle: { fontSize: 8, bold: true, color: '#64748b', alignment: 'center' },
  metricCardValue: { fontSize: 16, bold: true, color: '#0f172a', alignment: 'center', margin: [0, 4, 0, 2] },
  footer: { fontSize: 8, color: '#94a3b8', margin: [0, 10, 0, 0] },
  signatureLine: { margin: [0, 50, 0, 0], alignment: 'center' },
  signatureText: { fontSize: 10, bold: true, color: '#334155', alignment: 'center' }
};

export const defaultStyle = {
  font: 'Roboto',
  fontSize: 10,
  color: '#334155'
};

export const pdfLayouts = {
  customLayout: {
    hLineWidth: (i: number, node: any) => (i === 0 || i === 1 || i === node.table.body.length) ? 1 : 0,
    vLineWidth: () => 0,
    hLineColor: () => '#e2e8f0',
    paddingLeft: () => 4,
    paddingRight: () => 4,
    paddingTop: () => 4,
    paddingBottom: () => 4,
  }
};
