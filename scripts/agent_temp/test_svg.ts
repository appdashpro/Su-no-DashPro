import pdfMake from 'pdfmake/build/pdfmake.js';
import pdfFonts from 'pdfmake/build/vfs_fonts.js';
import fs from 'fs';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

const docDefinition = {
  content: [
    {
      svg: '<svg width="300" height="200" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg"><text x="10" y="20" font-family="Arial" font-size="12" fill="black">Hello SVG Text!</text><rect x="10" y="30" width="100" height="50" fill="blue" /></svg>'
    }
  ]
};

const pdfDocGenerator = pdfMake.createPdf(docDefinition);
pdfDocGenerator.getBuffer((buffer) => {
  fs.writeFileSync('test_svg.pdf', buffer);
  console.log('PDF generated successfully');
});
