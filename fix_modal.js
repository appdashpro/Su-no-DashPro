import fs from 'fs';

let filePath = 'src/components/IntegradoDetailsModal.tsx';
let code = fs.readFileSync(filePath, 'utf-8');

// Replace {diff !== null ? (diff > 0 ? `+${diff}` : diff) : '-'}
code = code.replace(/\{diff !== null \? \(diff > 0 \? `\+\$\{diff\}` : diff\) : '-'\}/g, 
  "{diff !== null ? (diff > 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2)) : '-'}");

// Replace {consumoReal ?? '-'} kg
code = code.replace(/\{consumoReal \?\? '-'\}/g, 
  "{consumoReal !== null && consumoReal !== undefined ? consumoReal.toFixed(2) : '-'}");

// Replace ({diffAcumulado > 0 ? `+${diffAcumulado}` : diffAcumulado})
code = code.replace(/\(\{diffAcumulado > 0 \? `\+\$\{diffAcumulado\}` : diffAcumulado\}\)/g, 
  "({diffAcumulado > 0 ? `+${diffAcumulado.toFixed(2)}` : diffAcumulado.toFixed(2)})");

fs.writeFileSync(filePath, code, 'utf-8');
console.log("Fixed IntegradoDetailsModal");
