const fs = require('fs');
let code = fs.readFileSync('src/components/VisitForm.tsx', 'utf8');

// Allow negative age calculation
code = code.replace(
  /newData\.idade = diffDays >= 0 \? diffDays : 0;/,
  `newData.idade = diffDays;`
);

// Remove min="1" from the input
code = code.replace(
  /<input\s*\n\s*type="number"\s*\n\s*name="idade"\s*\n\s*min="1"\s*\n\s*max="150"/,
  `<input 
 type="number" 
 name="idade"
 max="150"`
);

// Fallback if the formatting is slightly different
code = code.replace(
  /<input[^>]*name="idade"[^>]*min="1"[^>]*>/,
  (match) => match.replace('min="1"', '')
);

fs.writeFileSync('src/components/VisitForm.tsx', code);
