const fs = require('fs');
let code = fs.readFileSync('src/lib/auth.ts', 'utf8');

// I will just look for the try-catch of saveUserWithPermissions
const startIndex = code.indexOf('export async function saveUserWithPermissions');
const endFunc = code.indexOf('export async function deleteUser');
console.log(code.substring(startIndex, endFunc));
