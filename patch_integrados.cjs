const fs = require('fs');
let content = fs.readFileSync('src/components/Integrados.tsx', 'utf8');

// 1. Add import for IntegradoDetailsModal
if (!content.includes('IntegradoDetailsModal')) {
    content = content.replace("import { cn } from '../lib/utils';", "import { cn } from '../lib/utils';\nimport { IntegradoDetailsModal } from './IntegradoDetailsModal';");
}

// 2. Add state for selectedIntegradoDetails
if (!content.includes('selectedIntegradoDetails')) {
    content = content.replace("const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);", "const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);\n  const [selectedIntegradoDetails, setSelectedIntegradoDetails] = useState<string | null>(null);");
}

// 3. Add Details button in table row
const replaceButton = `
                        <div className="flex items-center justify-end gap-3">
                          <button 
                            onClick={() => setSelectedIntegradoDetails(i.id)}
                            className="text-slate-600 hover:text-slate-900 text-xs font-semibold px-2 py-1 rounded hover:bg-slate-100 transition-colors"
                            title="Ver Detalhes do Lote"
                          >
                            Detalhes
                          </button>
                          <button 
                            onClick={() => {
`;
content = content.replace(/<div className="flex items-center justify-end gap-3">\s*<button \s*onClick=\{\(\) => \{\s*setEditingId\(i\.id\);/g, replaceButton + "                              setEditingId(i.id);");

// 4. Render modal at the end
const modalJSX = `
      {selectedIntegradoDetails && (
        <IntegradoDetailsModal
          integradoId={selectedIntegradoDetails}
          visits={visits}
          integrados={integrados}
          onClose={() => setSelectedIntegradoDetails(null)}
        />
      )}
    </div>
  );
}
`;
content = content.replace(/<\/div>\s*\);\s*}\s*$/g, modalJSX);

fs.writeFileSync('src/components/Integrados.tsx', content, 'utf8');
