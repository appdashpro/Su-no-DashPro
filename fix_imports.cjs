const fs = require('fs');
let code = fs.readFileSync('src/components/EmpresaConfigGestao.tsx', 'utf8');

code = code.replace(
  "import { Settings, Plus, Trash2, Save, AlertCircle, Check, MapPin, Map } from 'lucide-react';",
  "import { Settings, Plus, Trash2, Save, AlertCircle, Check, MapPin, Map, Package } from 'lucide-react';\nimport { CatalogoGestao } from './CatalogoGestao';"
);
if (!code.includes('import { CatalogoGestao }')) {
    code = "import { Package } from 'lucide-react';\nimport { CatalogoGestao } from './CatalogoGestao';\n" + code;
}
fs.writeFileSync('src/components/EmpresaConfigGestao.tsx', code);

// fix storage.ts entData2 redeclaration
let scode = fs.readFileSync('src/lib/storage.ts', 'utf8');
scode = scode.replace("const { data: entData2 } = await supabase.from('visita_entregas')", "const { data: entData3 } = await supabase.from('visita_entregas')");
scode = scode.replace("entregasDB = entData2 || [];", "entregasDB = entData3 || [];");
fs.writeFileSync('src/lib/storage.ts', scode);
