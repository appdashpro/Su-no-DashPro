const fs = require('fs');
let code = fs.readFileSync('src/components/VisitForm.tsx', 'utf8');

const targetSpread = `onSave({
      ...visitData,`;

const replaceSpread = `
      // Format all numeric fields related to carga and consumo
      const formattedVisitData = { ...visitData };
      const numericFields = [
        'cargaAlojamento', 'consumoAlojamento',
        'cargaCrescimento1', 'consumoCrescimento1',
        'cargaCrescimento2', 'consumoCrescimento2',
        'cargaCrescimento3', 'consumoCrescimento3',
        'cargaTerminacao1', 'consumoTerminacao1',
        'cargaTerminacao2', 'consumoTerminacao2'
      ];
      numericFields.forEach(k => {
        if (formattedVisitData[k] !== undefined && formattedVisitData[k] !== null && String(formattedVisitData[k]).trim() !== '') {
          formattedVisitData[k] = Number(Number(formattedVisitData[k]).toFixed(2));
        }
      });

    onSave({
      ...formattedVisitData,`;

code = code.replace(targetSpread, replaceSpread);
fs.writeFileSync('src/components/VisitForm.tsx', code);
