const fs = require('fs');
let formCode = fs.readFileSync('src/components/VisitForm.tsx', 'utf8');

const keysToRound = [
  'cargaAlojamento', 'consumoAlojamento', 
  'cargaCrescimento1', 'consumoCrescimento1',
  'cargaCrescimento2', 'consumoCrescimento2',
  'cargaCrescimento3', 'consumoCrescimento3',
  'cargaTerminacao1', 'consumoTerminacao1',
  'cargaTerminacao2', 'consumoTerminacao2'
];

keysToRound.forEach(key => {
  const target = `\n    ${key}: visitData.${key} !== undefined && visitData.${key} !== null && String(visitData.${key}).trim() !== '' ? Number(visitData.${key}) : undefined,`;
  const replace = `\n    ${key}: visitData.${key} !== undefined && visitData.${key} !== null && String(visitData.${key}).trim() !== '' ? Number(Number(visitData.${key}).toFixed(2)) : undefined,`;
  formCode = formCode.replace(target, replace);
});

fs.writeFileSync('src/components/VisitForm.tsx', formCode);
