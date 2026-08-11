const fs = require('fs');
let code = fs.readFileSync('src/components/Tutorial.tsx', 'utf-8');

function addTouchHandlers(btnStr, propName) {
  // It replaces `<button\n        {...closeProps}` 
  // with `<button\n        {...closeProps}\n        onTouchStart={(e) => e.stopPropagation()}\n        onTouchEnd={(e) => { e.preventDefault(); if (${propName}.onClick) ${propName}.onClick(e as any); }}`
  
  // This is a bit tricky with regex, let's do simple string replacements.
  return btnStr;
}

// 1. closeProps button
code = code.replace(
  /<button\s+\{\.\.\.closeProps\}\s+className="([^"]+)"\s*>/,
  '<button\n        {...closeProps}\n        onTouchStart={(e) => e.stopPropagation()}\n        onTouchEnd={(e) => { e.preventDefault(); if (closeProps.onClick) closeProps.onClick(e as any); }}\n        className="$1 touch-manipulation"\n      >'
);

// 2. backProps button
code = code.replace(
  /<button\s+\{\.\.\.backProps\}\s+className="([^"]+)"\s*>/,
  '<button\n                {...backProps}\n                onTouchStart={(e) => e.stopPropagation()}\n                onTouchEnd={(e) => { e.preventDefault(); if (backProps.onClick) backProps.onClick(e as any); }}\n                className="$1 touch-manipulation"\n              >'
);

// 3. primaryProps button
code = code.replace(
  /<button\s+\{\.\.\.primaryProps\}\s+className="([^"]+)"\s*>/,
  '<button\n              {...primaryProps}\n              onTouchStart={(e) => e.stopPropagation()}\n              onTouchEnd={(e) => { e.preventDefault(); if (primaryProps.onClick) primaryProps.onClick(e as any); }}\n              className="$1 touch-manipulation"\n            >'
);

fs.writeFileSync('src/components/Tutorial.tsx', code);
console.log('patched Tutorial touch events');
