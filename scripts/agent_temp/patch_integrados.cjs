const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src', 'components', 'Integrados.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const oldButton = `{i.status === 'Fechado' && (
                            <button 
                              onClick={() => setReportIntegradoId(i.id)}
                              className="text-emerald-600 hover:text-emerald-700 text-xs font-bold uppercase tracking-wider px-2 py-1 rounded hover:bg-emerald-50 transition-colors flex items-center gap-1"
                              title="Gerar Relatório Final (PDF)"
                            >
                              <FileDown size={14} /> Relatório
                            </button>
                          )}
                          <button 
                            onClick={() => setSelectedIntegradoDetails(i.id)}`;

const newButton = `                          <button 
                            onClick={() => setReportIntegradoId(i.id)}
                            className="text-emerald-600 hover:text-emerald-700 text-xs font-bold uppercase tracking-wider px-2 py-1 rounded hover:bg-emerald-50 transition-colors flex items-center gap-1"
                            title="Gerar Relatório Analítico (PDF)"
                          >
                            <FileDown size={14} /> Relatório
                          </button>
                          <button 
                            onClick={() => setSelectedIntegradoDetails(i.id)}`;

content = content.replace(oldButton, newButton);
fs.writeFileSync(filePath, content);
console.log('Update complete Integrados');
