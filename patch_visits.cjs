const fs = require('fs');
let code = fs.readFileSync('src/components/Visits.tsx', 'utf8');

if (!code.includes('generateWhatsAppSummary')) {
  code = code.replace(
    "import { ConsolidatedVisitasModal } from './ConsolidatedVisitasModal';",
    "import { ConsolidatedVisitasModal } from './ConsolidatedVisitasModal';\nimport { generateWhatsAppSummary } from '../lib/whatsapp';"
  );
}

if (!code.includes('MessageCircle')) {
  code = code.replace(
    "Search, ArrowUpDown, Download, Plus, Eye, X, Trash2, Bug, Trash, FileText",
    "Search, ArrowUpDown, Download, Plus, Eye, X, Trash2, Bug, Trash, FileText, MessageCircle"
  );
}

const targetButton = `<button
                              onClick={() => {
                                setDeleteConfirmId(null);
                                onEditVisit(v.id);
                              }}`;

const newButtonCode = `<button
                              onClick={() => {
                                const url = \`https://wa.me/?text=\${generateWhatsAppSummary(v, int)}\`;
                                window.open(url, '_blank');
                              }}
                              className="text-green-600 hover:text-green-800 text-xs font-semibold px-2 py-1 rounded hover:bg-green-50 transition-colors w-full text-center flex items-center justify-center gap-1"
                              title="Compartilhar via WhatsApp"
                            >
                              <MessageCircle className="w-3 h-3" /> WhatsApp
                            </button>
                            <button
                              onClick={() => {
                                setDeleteConfirmId(null);
                                onEditVisit(v.id);
                              }}`;

code = code.replace(targetButton, newButtonCode);
fs.writeFileSync('src/components/Visits.tsx', code);
