const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src', 'components', 'LoteReportModal.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace("Relatório de Fechamento de Lote", "{lote?.status === 'Fechado' ? 'Relatório de Fechamento de Lote' : 'Relatório Parcial de Lote'}");
content = content.replace("Relatório_Fechamento_", "Relatorio_");
content = content.replace("<strong>Data Fechamento:</strong> {new Date((lote?.fechamentoDate||'') + 'T12:00:00').toLocaleDateString('pt-BR')}", "{lote?.fechamentoDate && <React.Fragment><strong>Data Fechamento:</strong> {new Date(lote.fechamentoDate + 'T12:00:00').toLocaleDateString('pt-BR')}</React.Fragment>}");

fs.writeFileSync(filePath, content);
console.log('Update complete title');
