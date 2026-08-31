import fs from 'fs';

let content = fs.readFileSync('src/reports/templates/VisitaReport.ts', 'utf-8');
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('y2:')) {
    console.log(`Line ${i + 1}: ${lines[i]}`);
  }
}
