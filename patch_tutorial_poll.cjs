const fs = require('fs');
let code = fs.readFileSync('src/components/Tutorial.tsx', 'utf-8');

const oldLogic = /const checkVisibility = \[\s\S\]*?setTimeout\(\(\) => checkVisibility\(0\), 100\);/m;
const checkVisRegex = /const checkVisibility = \(\(attempts = 0\)? => \{[\s\S]*?setTimeout\(\(\) => checkVisibility\(0\), 100\);/;

// Wait, I will just rewrite handleJoyrideCallback completely to avoid regex issues.
