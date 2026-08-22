const fs = require('fs');
const path = './src/components/ReferenceCurve.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "import { Save, AlertCircle, Edit2, Check, X } from 'lucide-react';",
  "import { AlertCircle, Check } from 'lucide-react';"
);

content = content.replace("  const [saving, setSaving] = useState(false);\n", "");
content = content.replace("  const [isAddingCurva, setIsAddingCurva] = useState(false);\n", "");
content = content.replace("  const [newCurva, setNewCurva] = useState<Partial<CurveConfig>>({});\n", "");

fs.writeFileSync(path, content);
