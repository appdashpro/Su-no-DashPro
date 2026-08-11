import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add Moon and Sun to lucide-react imports
if 'Moon,' not in content:
    content = content.replace("Menu, X, LogOut, Download, Wifi, WifiOff, RefreshCw", "Menu, X, LogOut, Download, Wifi, WifiOff, RefreshCw, Moon, Sun")

# Add isDarkMode state
state_code = """  const [isSyncing, setIsSyncing] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);
"""
if 'isDarkMode' not in content:
    content = content.replace("  const [isSyncing, setIsSyncing] = useState(false);", state_code)

# Add toggle button next to online status
toggle_button = """              )}
            </div>
            
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              className="text-slate-500 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors" 
              title={isDarkMode ? "Modo Claro" : "Modo Escuro"}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <Notifications"""
if 'setIsDarkMode(!isDarkMode)' not in content:
    content = content.replace("              )}\n            </div>\n            <Notifications", toggle_button)

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("Patched App.tsx for dark mode")
