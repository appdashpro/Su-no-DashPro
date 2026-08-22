const fs = require('fs');
const path = './src/components/ReferenceCurve.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

// We know the general area of these things based on line numbers from previous grep.
// But line numbers might shift.
// Let's filter out the `isAddingCurva` button
let newLines = [];
let skip = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  if (line.includes('Nova Versão') && lines[i-1].includes('hover:bg-emerald-200')) {
    // skip this button block backwards
    let j = newLines.length - 1;
    while (!newLines[j].includes('<button')) {
      newLines.pop();
      j--;
    }
    newLines.pop(); // remove <button
    continue;
  }

  if (line.includes('{isAddingCurva && (')) {
    skip = true;
    continue;
  }
  if (skip) {
    if (line.includes('{curvas.length === 0 ? (')) {
      skip = false;
      newLines.push(line);
    }
    continue;
  }

  if (line.includes('<th className="px-4 py-3 text-right">Ações</th>')) {
    continue;
  }

  if (line.includes('<td className="px-4 py-3 text-right">') && lines[i+1].includes('<button') && lines[i+2].includes('onClick={async () => {')) {
    // skip the Excluir td
    let j = i;
    while (!lines[j].includes('</td>')) {
      j++;
    }
    i = j;
    continue;
  }

  newLines.push(line);
}

fs.writeFileSync(path, newLines.join('\n'));
