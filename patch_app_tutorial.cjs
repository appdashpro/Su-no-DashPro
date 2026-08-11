const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Add import for Tutorial and HelpCircle
code = code.replace(
  "import { Menu, Wifi, WifiOff, RefreshCw, Sun, Moon, Users, LogOut, ArrowLeft, ClipboardList, X } from 'lucide-react';",
  "import { Menu, Wifi, WifiOff, RefreshCw, Sun, Moon, Users, LogOut, ArrowLeft, ClipboardList, X, HelpCircle } from 'lucide-react';\nimport { Tutorial } from './components/Tutorial';"
);

// Add tutorial state inside App component
code = code.replace(
  "const [dbError, setDbError] = useState<string | null>(null);",
  "const [dbError, setDbError] = useState<string | null>(null);\n  const [runTutorial, setRunTutorial] = useState(() => {\n    if (typeof window !== 'undefined') {\n      return localStorage.getItem('tutorial_completed') !== 'true';\n    }\n    return true;\n  });"
);

// Add HelpCircle button to header
const headerButtons = `<button \n              onClick={() => setIsDarkMode(!isDarkMode)} \n              className="text-slate-500 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors" \n              title={isDarkMode ? "Modo Claro" : "Modo Escuro"}\n            >\n              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}\n            </button>`;

const newHeaderButtons = `${headerButtons}
            <button 
              onClick={() => setRunTutorial(true)} 
              className="text-slate-500 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors" 
              title="Iniciar Tutorial"
            >
              <HelpCircle className="w-5 h-5" />
            </button>`;
            
code = code.replace(headerButtons, newHeaderButtons);

// Inject <Tutorial> at the end of the return
code = code.replace(
  "</ErrorBoundary>\n          </div>\n        </div>\n      </main>\n    </div>\n  );",
  "</ErrorBoundary>\n          </div>\n        </div>\n      </main>\n      <Tutorial run={runTutorial} onFinish={() => {\n        setRunTutorial(false);\n        localStorage.setItem('tutorial_completed', 'true');\n      }} />\n    </div>\n  );"
);

fs.writeFileSync('src/App.tsx', code);
console.log('patched app with tutorial');
