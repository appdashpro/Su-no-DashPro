import fs from 'fs';
let content = fs.readFileSync('src/components/Integrados.tsx', 'utf-8');

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
    /<\/div>[\s\n]*\);[\s\n]*\}/,
    `${modalJSX}\n    </div>\n  );\n}`
  );
  fs.writeFileSync('src/components/Integrados.tsx', content);
}
