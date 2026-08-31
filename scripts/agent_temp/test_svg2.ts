import PdfPrinter from 'pdfmake';
import fs from 'fs';

const fonts = {
  Roboto: {
    normal: 'node_modules/pdfmake/build/vfs_fonts.js',
    bold: 'node_modules/pdfmake/build/vfs_fonts.js',
    italics: 'node_modules/pdfmake/build/vfs_fonts.js',
    bolditalics: 'node_modules/pdfmake/build/vfs_fonts.js'
  }
};

const printer = new PdfPrinter(fonts);

const docDefinition = {
  content: [
    {
      svg: '<svg width="300" height="200" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg"><text x="10" y="20" font-family="Arial" font-size="12" fill="black">Hello SVG Text!</text><rect x="10" y="30" width="100" height="50" fill="blue" /></svg>'
    }
  ]
};

const pdfDoc = printer.createPdfKitDocument(docDefinition);
pdfDoc.pipe(fs.createWriteStream('test_svg2.pdf'));
pdfDoc.end();
