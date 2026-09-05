const fs = require('fs');
let code = fs.readFileSync('src/components/EmpresaConfigGestao.tsx', 'utf8');

code = code.replace(
  "import { Save, AlertCircle, Plus, Trash2, Settings, X, RotateCcw, Check } from 'lucide-react';",
  "import { Save, AlertCircle, Plus, Trash2, Settings, X, RotateCcw, Check, Edit2 } from 'lucide-react';"
);

fs.writeFileSync('src/components/EmpresaConfigGestao.tsx', code);
