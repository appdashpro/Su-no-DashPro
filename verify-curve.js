const { growthCurvePastreFemea } = require('./dist/server.cjs'); // Can't easily require ts in plain JS. Let's just use regex or eval.

const fs = require('fs');
const content = fs.readFileSync('src/pastreFemeaData.ts', 'utf-8');

// Just print the exact JSON of the array to see if it matches.
const arrayMatch = content.match(/export const growthCurvePastreFemea: GrowthCurvePoint\[\] = (\[[\s\S]*?\]);/);
if (arrayMatch) {
  const data = eval(arrayMatch[1]);
  console.log("Day 15:", data.find(d => d.dia === 15));
  console.log("Day 80:", data.find(d => d.dia === 80));
}
