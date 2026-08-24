const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src', 'components', 'Integrados.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Import LoteReportModal
content = content.replace(
  "import { IntegradoDetailsModal } from './IntegradoDetailsModal';",
  "import { IntegradoDetailsModal } from './IntegradoDetailsModal';\nimport { LoteReportModal } from './LoteReportModal';"
);

// Add state
content = content.replace(
  "const [selectedIntegradoDetails, setSelectedIntegradoDetails] = useState<string | null>(null);",
  "const [selectedIntegradoDetails, setSelectedIntegradoDetails] = useState<string | null>(null);\n  const [reportIntegradoId, setReportIntegradoId] = useState<string | null>(null);"
);

// Add button
const buttonsRegex = /<button \n\s*onClick=\{\(\) => setSelectedIntegradoDetails\(i\.id\)\}/;
content = content.replace(
  buttonsRegex,
  `{i.status === 'Fechado' && (
                            <button 
                              onClick={() => setReportIntegradoId(i.id)}
                              className="text-emerald-600 hover:text-emerald-700 text-xs font-bold uppercase tracking-wider px-2 py-1 rounded hover:bg-emerald-50 transition-colors flex items-center gap-1"
                              title="Gerar Relatório Final (PDF)"
                            >
                              <FileDown size={14} /> Relatório
                            </button>
                          )}
                          <button 
                            onClick={() => setSelectedIntegradoDetails(i.id)}`
);

// Add modal render
content = content.replace(
  "      {selectedIntegradoDetails && (",
  `      {reportIntegradoId && (
        <LoteReportModal
          integradoId={reportIntegradoId}
          visits={visits}
          integrados={integrados}
          onClose={() => setReportIntegradoId(null)}
        />
      )}
      
      {selectedIntegradoDetails && (`
);

fs.writeFileSync(filePath, content);
console.log('Update complete');
