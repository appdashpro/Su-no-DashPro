const fs = require('fs');
let code = fs.readFileSync('src/components/Prioridades.tsx', 'utf8');

// Replace boolean logic
const targetLogic = `                  // Feed deviation: Let's consider < -2 or > 5 as bad, or we can use the same logic as Dashboard (+/- 5). 
                  // But usually +/- bounds are configured or standard. Let's use < -2 (danger) and > 5 (waste) or just > 2.
                  // Dashboard uses > 5 as Red.
                  const isFeedOut = item.feedDeviation !== null && (item.feedDeviation < -2 || item.feedDeviation > 5);
                  const isFeedGood = item.feedDeviation !== null && (item.feedDeviation >= -2 && item.feedDeviation <= 2);`;

const replaceLogic = `                  // Feed deviation matches Dashboard: > 5 red, < -5 green, otherwise blue.
                  const isFeedRed = item.feedDeviation !== null && item.feedDeviation > 5;
                  const isFeedGreen = item.feedDeviation !== null && item.feedDeviation < -5;
                  const isFeedBlue = item.feedDeviation !== null && Math.abs(item.feedDeviation) <= 5;`;

code = code.replace(targetLogic, replaceLogic);

// Replace TSX rendering
const targetTSX = `<TrendingDown className={\`h-3.5 w-3.5 \${isFeedOut ? 'text-red-500' : isFeedGood ? 'text-emerald-500' : 'text-slate-400'}\`} />
                              <span className={isFeedOut ? 'text-red-700 font-bold' : isFeedGood ? 'text-emerald-700 font-medium' : 'text-slate-600 font-medium'}>`;

const replaceTSX = `<TrendingDown className={\`h-3.5 w-3.5 \${isFeedRed ? 'text-red-500' : isFeedGreen ? 'text-emerald-500' : isFeedBlue ? 'text-blue-500' : 'text-slate-400'}\`} />
                              <span className={isFeedRed ? 'text-red-700 font-bold' : isFeedGreen ? 'text-emerald-700 font-bold' : isFeedBlue ? 'text-blue-700 font-medium' : 'text-slate-600 font-medium'}>`;

code = code.replace(targetTSX, replaceTSX);

fs.writeFileSync('src/components/Prioridades.tsx', code);
