const fs = require('fs');
let content = fs.readFileSync('src/components/IntegradoDetailsModal.tsx', 'utf8');

const targetStr = `              <h4 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">Histórico de Visitas</h4>`;

if (content.includes(targetStr)) {
    console.log("Found target!");
} else {
    console.log("Not found, let's look for something similar.");
    console.log("IndexOf: ", content.indexOf("Histórico de Visitas"));
}

