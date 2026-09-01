const fs = require('fs');
let code = fs.readFileSync('src/components/VisitForm.tsx', 'utf8');

const regex = /if \(vivos > 0\) \{[\s\S]*?newData\.consumoAcumuladoReal = undefined;\n    \}\n \}/;
const replacement = `if (vivos > 0) {
    newData.consumoAlojamento = newData.cargaAlojamento ? Number((Number(newData.cargaAlojamento) / vivos).toFixed(2)) : undefined;
    newData.consumoCrescimento1 = newData.cargaCrescimento1 ? Number((Number(newData.cargaCrescimento1) / vivos).toFixed(2)) : undefined;
    newData.consumoCrescimento2 = newData.cargaCrescimento2 ? Number((Number(newData.cargaCrescimento2) / vivos).toFixed(2)) : undefined;
    newData.consumoCrescimento3 = newData.cargaCrescimento3 ? Number((Number(newData.cargaCrescimento3) / vivos).toFixed(2)) : undefined;
    newData.consumoTerminacao1 = newData.cargaTerminacao1 ? Number((Number(newData.cargaTerminacao1) / vivos).toFixed(2)) : undefined;
    newData.consumoTerminacao2 = newData.cargaTerminacao2 ? Number((Number(newData.cargaTerminacao2) / vivos).toFixed(2)) : undefined;
} else {
    newData.consumoAlojamento = undefined;
    newData.consumoCrescimento1 = undefined;
    newData.consumoCrescimento2 = undefined;
    newData.consumoCrescimento3 = undefined;
    newData.consumoTerminacao1 = undefined;
    newData.consumoTerminacao2 = undefined;
}

const sumCargas = (Number(newData.cargaAlojamento) || 0) +
                  (Number(newData.cargaCrescimento1) || 0) +
                  (Number(newData.cargaCrescimento2) || 0) +
                  (Number(newData.cargaCrescimento3) || 0) +
                  (Number(newData.cargaTerminacao1) || 0) +
                  (Number(newData.cargaTerminacao2) || 0);

if (name.startsWith('carga')) {
    newData.volumeTotalCargas = sumCargas > 0 ? sumCargas : undefined;
}

const currentVolumeTotal = Number(newData.volumeTotalCargas) || sumCargas;

if (['carga', 'volumeTotalCargas', 'animaisAlojados', 'animaisMortos', 'descartesPeriodo'].some(k => name.startsWith(k))) {
    if (currentVolumeTotal > 0 && vivos > 0) {
        newData.consumoAcumuladoReal = Number((currentVolumeTotal / vivos).toFixed(2));
    } else {
        newData.consumoAcumuladoReal = undefined;
    }
}`;
code = code.replace(regex, replacement);

fs.writeFileSync('src/components/VisitForm.tsx', code);
