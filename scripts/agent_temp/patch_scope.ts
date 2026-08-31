import fs from 'fs';

function fixScope(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // We have this block:
  // if (validScores.length > 0) {
  //   const totalMax = validScores.length * 3;
  //   ...
  // }
  
  // Actually, I can just declare the vars before the `if` block.
  content = content.replace(/let healthColor = '#1e293b';/g, '');
  content = content.replace(/let healthStatus = 'Não Avaliado';/g, '');
  content = content.replace(/const diagnosticoTableBody: any\[\] = \[/g, '');
  content = content.replace(/\[\s*\{\s*text:\s*'Ponto de Avaliação'[\s\S]*?\]\s*\];/g, '');
  
  // Re-declare them above `if (validScores.length > 0)`
  const insertVars = `  let healthColor = '#1e293b';
  let healthStatus = 'Não Avaliado';
  const diagnosticoTableBody: any[] = [
    [
      { text: 'Ponto de Avaliação', style: 'tableHeader' },
      { text: 'Resultado', style: 'tableHeader' },
      { text: 'Pontos', style: 'tableHeader', alignment: 'center' }
    ]
  ];
  if (validScores.length > 0) {`;

  content = content.replace(/if \(validScores\.length > 0\) \{/, insertVars);
  
  fs.writeFileSync(filePath, content);
}

fixScope('src/reports/templates/LoteReport.ts');
fixScope('src/reports/templates/VisitaReport.ts');
