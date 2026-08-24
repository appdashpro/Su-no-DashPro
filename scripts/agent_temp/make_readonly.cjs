const fs = require('fs');
const path = './src/components/ReferenceCurve.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove "Nova Versão" button
const novaVersaoBtnRegex = /<button[\s\S]*?onClick=\{\(\) => \{\s*setIsAddingCurva\(true\)[\s\S]*?>\s*Nova Versão\s*<\/button>/g;
content = content.replace(novaVersaoBtnRegex, '');

// 2. Remove isAddingCurva block
// Using indexOf and counting braces/divs is safer since it's a huge block, or I can just regex match `{isAddingCurva && ( ... )}` if I am careful.
// Let's find `{isAddingCurva && (`
const addBlockStart = content.indexOf('{isAddingCurva && (');
if (addBlockStart !== -1) {
  let depth = 0;
  let inString = false;
  let endBlockIdx = -1;
  for (let i = addBlockStart; i < content.length; i++) {
    if (content[i] === '"' || content[i] === "'") inString = !inString;
    if (!inString) {
      if (content[i] === '{' || content[i] === '(') depth++;
      else if (content[i] === '}' || content[i] === ')') depth--;
    }
    // `isAddingCurva && (` has a depth increase, and eventually closes. 
    // Specifically `{isAddingCurva && ( <div...> ... </div> )}`
    // Wait, simple matching:
    if (content.substr(i, 8) === ')}      ' || content.substr(i, 8) === ')}\n\n    ') {
       // Too risky to parse brackets like this.
    }
  }
}

