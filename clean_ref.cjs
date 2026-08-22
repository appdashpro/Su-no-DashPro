const fs = require('fs');
const path = './src/components/ReferenceCurve.tsx';
let content = fs.readFileSync(path, 'utf8');

const startIndex = content.indexOf('  const handleSave = async () => {');
if (startIndex !== -1) {
  // Find the end of handleSave
  let braceCount = 0;
  let endIndex = -1;
  let started = false;
  for (let i = startIndex; i < content.length; i++) {
    if (content[i] === '{') {
      braceCount++;
      started = true;
    } else if (content[i] === '}') {
      braceCount--;
      if (started && braceCount === 0) {
        endIndex = i + 1;
        break;
      }
    }
  }
  
  if (endIndex !== -1) {
    content = content.substring(0, startIndex) + content.substring(endIndex);
  }
}

// Remove handleCurveChange
const changeIdx = content.indexOf('  const handleCurveChange =');
if (changeIdx !== -1) {
  let braceCount = 0;
  let endIndex = -1;
  let started = false;
  for (let i = changeIdx; i < content.length; i++) {
    if (content[i] === '{') {
      braceCount++;
      started = true;
    } else if (content[i] === '}') {
      braceCount--;
      if (started && braceCount === 0) {
        endIndex = i + 1;
        break;
      }
    }
  }
  
  if (endIndex !== -1) {
    content = content.substring(0, changeIdx) + content.substring(endIndex);
  }
}

// Remove handleMetaChange
const metaIdx = content.indexOf('  const handleMetaChange =');
if (metaIdx !== -1) {
  let braceCount = 0;
  let endIndex = -1;
  let started = false;
  for (let i = metaIdx; i < content.length; i++) {
    if (content[i] === '{') {
      braceCount++;
      started = true;
    } else if (content[i] === '}') {
      braceCount--;
      if (started && braceCount === 0) {
        endIndex = i + 1;
        break;
      }
    }
  }
  
  if (endIndex !== -1) {
    content = content.substring(0, metaIdx) + content.substring(endIndex);
  }
}


fs.writeFileSync(path, content);
