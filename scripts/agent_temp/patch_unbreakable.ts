import fs from 'fs';

function addUnbreakable(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf-8');
  content = content.replace(
    /\{\s*stack: \[\s*\{\s*text: 'CURVA DE CONSUMO VS ESPERADO',/,
    "{ unbreakable: true, stack: [{ text: 'CURVA DE CONSUMO VS ESPERADO',"
  );
  fs.writeFileSync(filePath, content);
}

addUnbreakable('src/reports/templates/LoteReport.ts');
addUnbreakable('src/reports/templates/VisitaReport.ts');
