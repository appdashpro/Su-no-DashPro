const fs = require('fs');
let file = 'src/components/TratamentosFormSection.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Update Props
code = code.replace(
  "  alojamentoDate?: string;\n}",
  "  alojamentoDate?: string;\n  pesoAmostradoKg?: number;\n  onPesoChange?: (peso: number | undefined) => void;\n}"
);

// 2. Add to destructuring
code = code.replace(
  "export function TratamentosFormSection({ tratamentos, onChange, idade, animaisVivos, tipoLote, alojamentoDate }: Props) {",
  "export function TratamentosFormSection({ tratamentos, onChange, idade, animaisVivos, tipoLote, alojamentoDate, pesoAmostradoKg, onPesoChange }: Props) {"
);

// 3. Find expected weight based on age and curve
// Wait, manualWeight state is initialized with ''
// We should use `pesoAmostradoKg` as the initial/controlled state!
code = code.replace(
  "const [manualWeight, setManualWeight] = useState<number | ''>('');",
  "// Removed manualWeight state"
);

code = code.replace(
  "  const pesoEstimadoCurve = expectedWeightPoint ? expectedWeightPoint.pesoInicial : 0;\n  const effectiveWeight = manualWeight !== '' ? Number(manualWeight) : pesoEstimadoCurve;",
  "  const pesoEstimadoCurve = expectedWeightPoint ? expectedWeightPoint.pesoInicial : 0;\n  const effectiveWeight = pesoAmostradoKg !== undefined ? pesoAmostradoKg : pesoEstimadoCurve;"
);

code = code.replace(
  `  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setManualWeight(val === '' ? '' : parseFloat(val));
    const newWeight = val === '' ? pesoEstimadoCurve : parseFloat(val);`,
  `  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const newWeight = val === '' ? undefined : parseFloat(val);
    if (onPesoChange) onPesoChange(newWeight);
    const effectiveNewWeight = newWeight !== undefined ? newWeight : pesoEstimadoCurve;`
);

// Change effectiveWeight reference inside handleWeightChange
code = code.replace(
  "        if (t.doseMgKg && newWeight && animaisVivos) {",
  "        if (t.doseMgKg && effectiveNewWeight && animaisVivos) {"
);
code = code.replace(
  "          let mgPorDia = t.doseMgKg * newWeight * animaisVivos;",
  "          let mgPorDia = t.doseMgKg * effectiveNewWeight * animaisVivos;"
);

// Replace the input value binding
code = code.replace(
  "value={manualWeight === '' && pesoEstimadoCurve > 0 ? pesoEstimadoCurve.toFixed(2) : manualWeight}",
  "value={pesoAmostradoKg === undefined && pesoEstimadoCurve > 0 ? pesoEstimadoCurve.toFixed(2) : (pesoAmostradoKg || '')}"
);


fs.writeFileSync(file, code);
console.log("Patched TratamentosFormSection");
