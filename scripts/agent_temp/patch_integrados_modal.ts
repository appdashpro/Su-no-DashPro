import fs from 'fs';

let content = fs.readFileSync('src/components/Integrados.tsx', 'utf-8');

// Add import
if (!content.includes('ConsolidatedLotesModal')) {
  content = content.replace(
    "import { IntegradoDetailsModal } from './IntegradoDetailsModal';",
    "import { IntegradoDetailsModal } from './IntegradoDetailsModal';\nimport { ConsolidatedLotesModal } from './ConsolidatedLotesModal';"
  );
}

// Add state
if (!content.includes('isConsolidadoModalOpen')) {
  content = content.replace(
    "const [selectedLotes, setSelectedLotes] = useState<Set<string>>(new Set());",
    "const [selectedLotes, setSelectedLotes] = useState<Set<string>>(new Set());\n  const [isConsolidadoModalOpen, setIsConsolidadoModalOpen] = useState(false);"
  );
}

// Replace the inline Consolidado button with a static one next to Search
const searchAreaRegex = /<div className="relative w-full sm:w-56">[\s\S]*?<Search className="w-4 h-4 text-slate-400 absolute left-2\.5 top-1\/2 -translate-y-1\/2" \/>/;
content = content.replace(
  /\{selectedLotes\.size > 0 && \([\s\S]*?\}\)[\s\S]*?<div className="relative w-full sm:w-56">/,
  `<div className="flex gap-2">
              <button
                onClick={() => setIsConsolidadoModalOpen(true)}
                className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-blue-100 transition-colors shadow-sm"
              >
                <FileDown size={14} />
                <span className="hidden sm:inline">PDF Consolidado</span>
              </button>
            </div>
            <div className="relative w-full sm:w-56">`
);

// Add Modal before the last </div>
const modalJSX = `
      <ConsolidatedLotesModal
        isOpen={isConsolidadoModalOpen}
        onClose={() => setIsConsolidadoModalOpen(false)}
        integrados={integrados}
        visits={visits}
        onGenerate={(selectedLotesArray) => {
          const selectedVisits = visits.filter(v => selectedLotesArray.some(l => l.id === v.integradoId));
          generateConsolidadoLotesPDF(selectedLotesArray, selectedVisits, configs, empresas);
          setIsConsolidadoModalOpen(false);
        }}
      />
`;

if (!content.includes('ConsolidatedLotesModal isOpen')) {
  content = content.replace(
    /<\/AnimatePresence>[\s\n]*<\/div>[\s\n]*\);[\s\n]*\}/,
    `</AnimatePresence>\n${modalJSX}\n</div>\n  );\n}`
  );
}

fs.writeFileSync('src/components/Integrados.tsx', content);

