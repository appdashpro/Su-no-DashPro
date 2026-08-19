const fs = require('fs');
let content = fs.readFileSync('src/components/IntegradoDetailsModal.tsx', 'utf8');

// Add useState to import
if (!content.includes('useState')) {
    content = content.replace("import React from 'react';", "import React, { useState } from 'react';");
}

// Add state
if (!content.includes('showAdherenceInfo')) {
    content = content.replace(
        "export function IntegradoDetailsModal({ integradoId, visits, integrados, onClose }: IntegradoDetailsModalProps) {",
        "export function IntegradoDetailsModal({ integradoId, visits, integrados, onClose }: IntegradoDetailsModalProps) {\n  const [showAdherenceInfo, setShowAdherenceInfo] = useState(false);"
    );
}

// Modify the trigger
const triggerSearch = `<div className="flex items-center gap-2" title="Precisão de aderência à meta de consumo">`;
const triggerReplace = `<button onClick={() => setShowAdherenceInfo(true)} className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer focus:outline-none" title="Clique para entender o cálculo">`;
content = content.replace(triggerSearch, triggerReplace);

// Don't forget to close button
content = content.replace(`{curveAccuracy}%
                      </span>
                    </div>`, `{curveAccuracy}%
                      </span>
                    </button>`);

// Add modal
const modalJSX = `
      {showAdherenceInfo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <h4 className="font-semibold text-slate-800">Cálculo de Aderência</h4>
              <button onClick={() => setShowAdherenceInfo(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 text-sm text-slate-600 space-y-4">
              <p>
                A <strong>Aderência</strong> representa o grau de precisão do consumo real em relação à meta de consumo estabelecida pela curva de referência (100% = meta exata).
              </p>
              
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <p className="font-semibold text-slate-700 mb-2 text-xs uppercase tracking-wider">Como calculamos:</p>
                <ol className="list-decimal list-inside space-y-2 text-xs">
                  <li>Para cada visita, calculamos o erro percentual:<br/>
                    <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-blue-600 mt-1 block w-fit">Erro = |Real - Meta| / Meta</code>
                  </li>
                  <li>Calculamos a precisão daquela visita:<br/>
                    <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-emerald-600 mt-1 block w-fit">Aderência = 100% - (Erro * 100)</code>
                  </li>
                  <li>A aderência final é a <strong>Média Aritmética</strong> de todas as visitas do lote.</li>
                </ol>
              </div>

              <div className="text-xs bg-blue-50 text-blue-800 p-3 rounded border border-blue-100">
                <strong>Nota sobre Cores:</strong> A cor do selo reflete o desvio da <em>última visita</em> (Vermelho {'>'} +5kg, Verde {'<'} -5kg, Azul dentro do limite).
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setShowAdherenceInfo(false)}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-lg transition-colors"
              >
                Entendi
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
`;

content = content.replace(/<\/div>\s*\);\s*}\s*$/, modalJSX);

fs.writeFileSync('src/components/IntegradoDetailsModal.tsx', content, 'utf8');
