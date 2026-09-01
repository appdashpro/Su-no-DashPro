const fs = require('fs');
let code = fs.readFileSync('src/components/VisitForm.tsx', 'utf8');

const regex = /if \(vivos > 0\) \{\n    newData\.consumoAlojamento = [^}]+\} else \{\n    newData\.consumoAlojamento = undefined;[\s\S]*?\n\}/;

const replacement = `if (['carga', 'animaisAlojados', 'animaisMortos', 'descartesPeriodo'].some(k => name.startsWith(k))) {
    if (vivos > 0) {
        if (newData.cargaAlojamento) newData.consumoAlojamento = Number((Number(newData.cargaAlojamento) / vivos).toFixed(2));
        else if (name === 'cargaAlojamento') newData.consumoAlojamento = undefined;

        if (newData.cargaCrescimento1) newData.consumoCrescimento1 = Number((Number(newData.cargaCrescimento1) / vivos).toFixed(2));
        else if (name === 'cargaCrescimento1') newData.consumoCrescimento1 = undefined;

        if (newData.cargaCrescimento2) newData.consumoCrescimento2 = Number((Number(newData.cargaCrescimento2) / vivos).toFixed(2));
        else if (name === 'cargaCrescimento2') newData.consumoCrescimento2 = undefined;

        if (newData.cargaCrescimento3) newData.consumoCrescimento3 = Number((Number(newData.cargaCrescimento3) / vivos).toFixed(2));
        else if (name === 'cargaCrescimento3') newData.consumoCrescimento3 = undefined;

        if (newData.cargaTerminacao1) newData.consumoTerminacao1 = Number((Number(newData.cargaTerminacao1) / vivos).toFixed(2));
        else if (name === 'cargaTerminacao1') newData.consumoTerminacao1 = undefined;

        if (newData.cargaTerminacao2) newData.consumoTerminacao2 = Number((Number(newData.cargaTerminacao2) / vivos).toFixed(2));
        else if (name === 'cargaTerminacao2') newData.consumoTerminacao2 = undefined;
    }
}`;

if (code.match(regex)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('src/components/VisitForm.tsx', code);
    console.log('Fixed');
} else {
    console.log('Regex not matched');
}
