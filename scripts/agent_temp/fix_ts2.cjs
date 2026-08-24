const fs = require('fs');
let content = fs.readFileSync('src/components/IntegradoDetailsModal.tsx', 'utf8');

content = content.replace(
  'if (chartData[i].esperado !== null && chartData[i].esperado >= accum) {',
  'if (chartData[i].esperado !== null && chartData[i].esperado! >= accum) {'
);

fs.writeFileSync('src/components/IntegradoDetailsModal.tsx', content);
