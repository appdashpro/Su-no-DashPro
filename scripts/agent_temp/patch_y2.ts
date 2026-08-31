import fs from 'fs';

function fixY2(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf-8');
  content = content.replace(
    /y2: \(v && v\.consumoAcumuladoReal !== null && v\.consumoAcumuladoReal !== undefined\) \? Number\(v\.consumoAcumuladoReal\) : null/g,
    'y2: (v && v.consumoAcumuladoReal && Number(v.consumoAcumuladoReal) > 0) ? Number(v.consumoAcumuladoReal) : null'
  );
  fs.writeFileSync(filePath, content);
}

fixY2('src/reports/templates/LoteReport.ts');
fixY2('src/reports/templates/VisitaReport.ts');
