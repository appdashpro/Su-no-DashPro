import fs from 'fs';
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');
if (!code.includes("id: 'medicamentos'")) {
  code = code.replace(
    "{ id: 'curva', label: 'Curva de Referência', icon: LineChart },",
    "{ id: 'medicamentos', label: 'Medicamentos', icon: Activity },\n  { id: 'curva', label: 'Curva de Referência', icon: LineChart },"
  );
  code = code.replace(
    "import { Home,",
    "import { Home, Activity,"
  );
  fs.writeFileSync('src/components/Sidebar.tsx', code);
  console.log("Patched Sidebar");
} else {
  console.log("Already patched");
}
