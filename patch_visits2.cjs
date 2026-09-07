const fs = require('fs');
let code = fs.readFileSync('src/components/Visits.tsx', 'utf8');

const targetButton = `title="Ver Detalhes do Lote"
                            >
                              Detalhes
                            </button>`;

// Replace carefully since I don't know the exact indentation. I'll use a regex.
code = code.replace(/title="Ver Detalhes do Lote"\s*>\s*Detalhes\s*<\/button>/g, `title="Ver Detalhes do Lote"
                            >
                              Detalhes
                            </button>
                            <button
                              onClick={() => {
                                const int = integrados.find(i => i.id === v.integradoId);
                                const url = \`https://wa.me/?text=\${generateWhatsAppSummary(v, int)}\`;
                                window.open(url, '_blank');
                              }}
                              className="text-emerald-600 hover:text-emerald-800 text-xs font-semibold px-2 py-1 rounded hover:bg-emerald-50 transition-colors w-full text-center flex items-center justify-center gap-1"
                              title="Compartilhar via WhatsApp"
                            >
                              <MessageCircle className="w-3 h-3" /> WhatsApp
                            </button>`);

fs.writeFileSync('src/components/Visits.tsx', code);
