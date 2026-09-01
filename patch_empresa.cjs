const fs = require('fs');
let code = fs.readFileSync('src/components/EmpresaConfigGestao.tsx', 'utf8');

// Add import
code = code.replace(
  "import { Settings, Plus, Trash2, Save, AlertCircle, Check, MapPin, Map } from 'lucide-react';",
  "import { Settings, Plus, Trash2, Save, AlertCircle, Check, MapPin, Map, Package } from 'lucide-react';\nimport { CatalogoGestao } from './CatalogoGestao';"
);

// Add activeTab state
code = code.replace(
  "const [newTecnico, setNewTecnico] = useState('');",
  "const [newTecnico, setNewTecnico] = useState('');\n  const [activeTab, setActiveTab] = useState<'geral' | 'catalogo'>('geral');"
);

// Add Tabs UI
const tabsUI = `
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('geral')}
            className={\`px-6 py-3 text-sm font-medium border-b-2 \${activeTab === 'geral' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}\`}
          >
            Configurações Gerais
          </button>
          <button
            onClick={() => setActiveTab('catalogo')}
            className={\`px-6 py-3 text-sm font-medium border-b-2 flex items-center gap-2 \${activeTab === 'catalogo' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}\`}
          >
            <Package className="w-4 h-4" />
            Catálogo de Insumos/Medicamentos
          </button>
        </div>
        
        <div className="p-6">
`;

code = code.replace(
  '<div className="p-6 border-b border-slate-100">',
  tabsUI + '\n          {activeTab === \'geral\' && (<>\n          <div className="mb-6 pb-6 border-b border-slate-100">'
);

// Close the activeTab condition
code = code.replace(
  "</button>\n              </div>\n            </div>\n          </div>\n        </div>",
  "</button>\n              </div>\n            </div>\n          </>)}\n          {activeTab === 'catalogo' && selectedEmpresaId && <CatalogoGestao empresaId={selectedEmpresaId} />}\n          {activeTab === 'catalogo' && !selectedEmpresaId && <div className=\"text-slate-500 text-center py-8\">Selecione o cliente acima para configurar o catálogo.</div>}\n        </div>"
);

fs.writeFileSync('src/components/EmpresaConfigGestao.tsx', code);
