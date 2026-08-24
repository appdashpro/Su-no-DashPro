const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src', 'components', 'IntegradoDetailsModal.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add lucide icons
content = content.replace("import { X } from 'lucide-react';", "import { X, ChevronDown, ChevronUp } from 'lucide-react';");

// 2. Add state
content = content.replace(
  "const [showAdherenceInfo, setShowAdherenceInfo] = useState(false);",
  "const [showAdherenceInfo, setShowAdherenceInfo] = useState(false);\n  const [showDiagInfo, setShowDiagInfo] = useState(false);"
);

// 3. Update the panel
const oldPanel = `                      <div className="flex flex-col gap-4">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm h-full">
                          <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">Como Interpretar o Gráfico</h4>
                          <div className="space-y-3 text-xs text-slate-600">
                            <p>O radar mapeia 7 indicadores chave de saúde e ambiência. <strong>Quanto mais preenchido o gráfico (pontas mais longas), mais saudável está o lote.</strong></p>
                            
                            <div className="space-y-2 pt-2 border-t border-slate-200">
                              <p className="font-semibold text-slate-700">Critério de Cores (Índice):</p>
                              <div className="flex items-start gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1"></span>
                                <p><strong className="text-emerald-700">Verde (&ge; 85%)</strong>: O gráfico se expande até as bordas. Indica conformidade com as boas práticas.</p>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1"></span>
                                <p><strong className="text-amber-700">Amarelo (65% - 84%)</strong>: O radar tem "recuos". Há pontos de atenção (ex: tosse leve, ventilação inadequada) que podem impactar o ganho de peso.</p>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1"></span>
                                <p><strong className="text-red-700">Vermelho (&lt; 65%)</strong>: O gráfico fica contraído no centro. Indica múltiplos fatores graves ocorrendo simultaneamente, exigindo ação curativa ou ajuste severo de manejo.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>`;

const newPanel = `                      <div className="flex flex-col gap-4">
                        <div className="bg-slate-50 rounded-xl border border-slate-200 shadow-sm h-fit">
                          <button 
                            onClick={() => setShowDiagInfo(!showDiagInfo)}
                            className="w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-slate-100 rounded-xl"
                          >
                            <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Como Interpretar o Gráfico</h4>
                            {showDiagInfo ? <ChevronUp size={18} className="text-slate-500" /> : <ChevronDown size={18} className="text-slate-500" />}
                          </button>
                          
                          <AnimatePresence>
                            {showDiagInfo && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="p-4 pt-0 space-y-3 text-xs text-slate-600">
                                  <p>O radar mapeia 7 indicadores chave de saúde e ambiência. <strong>Quanto mais preenchido o gráfico (pontas mais longas), mais saudável está o lote.</strong></p>
                                  
                                  <div className="space-y-2 pt-3 border-t border-slate-200">
                                    <p className="font-semibold text-slate-700">Critério de Cores (Índice):</p>
                                    <div className="flex items-start gap-2">
                                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1"></span>
                                      <p><strong className="text-emerald-700">Verde (&ge; 85%)</strong>: O gráfico se expande até as bordas. Indica conformidade com as boas práticas.</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1"></span>
                                      <p><strong className="text-amber-700">Amarelo (65% - 84%)</strong>: O radar tem "recuos". Há pontos de atenção (ex: tosse leve, ventilação inadequada) que podem impactar o ganho de peso.</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1"></span>
                                      <p><strong className="text-red-700">Vermelho (&lt; 65%)</strong>: O gráfico fica contraído no centro. Indica múltiplos fatores graves ocorrendo simultaneamente, exigindo ação curativa ou ajuste severo de manejo.</p>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>`;

content = content.replace(oldPanel, newPanel);
fs.writeFileSync(filePath, content);
console.log('Update complete');
