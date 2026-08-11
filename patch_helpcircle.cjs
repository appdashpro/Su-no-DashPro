const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  "import { Menu, X, LogOut, Download, Wifi, WifiOff, RefreshCw, Moon, Sun, Users, ClipboardList } from 'lucide-react';",
  "import { Menu, X, LogOut, Download, Wifi, WifiOff, RefreshCw, Moon, Sun, Users, ClipboardList, HelpCircle } from 'lucide-react';"
);

fs.writeFileSync('src/App.tsx', code);
console.log('patched HelpCircle');
