import fs from 'fs';

let content = fs.readFileSync('src/components/Visits.tsx', 'utf-8');

// Add import
if (!content.includes('generateConsolidadoCompletePDF')) {
  content = content.replace(
    "import { generateVisitaPDF, generateConsolidadoPDF } from '../reports/pdfGenerator';",
    "import { generateVisitaPDF, generateConsolidadoPDF, generateConsolidadoCompletePDF } from '../reports/pdfGenerator';\nimport { ConsolidatedVisitasModal } from './ConsolidatedVisitasModal';"
  );
}

// Add state
if (!content.includes('isConsolidadoModalOpen')) {
  content = content.replace(
    "const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);",
    "const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);\n  const [isConsolidadoModalOpen, setIsConsolidadoModalOpen] = useState(false);"
  );
}

// Replace button onClick
content = content.replace(
  "onClick={() => generateConsolidadoPDF(filteredVisits, integrados, empresas)}",
  "onClick={() => setIsConsolidadoModalOpen(true)}"
);

// Add modal before </AnimatePresence> at the end
const modalJSX = `
      <ConsolidatedVisitasModal
        isOpen={isConsolidadoModalOpen}
        onClose={() => setIsConsolidadoModalOpen(false)}
        visits={visits}
        integrados={integrados}
        empresas={empresas}
        onGenerate={(selectedVisits) => {
          generateConsolidadoCompletePDF(selectedVisits, integrados, empresas, configs, visits);
          setIsConsolidadoModalOpen(false);
        }}
      />
`;

if (!content.includes('ConsolidatedVisitasModal isOpen')) {
  content = content.replace(
    /<\/AnimatePresence>[\s\n]*<\/div>[\s\n]*\);[\s\n]*\}/,
    `</AnimatePresence>\n${modalJSX}\n</div>\n  );\n}`
  );
}

fs.writeFileSync('src/components/Visits.tsx', content);

