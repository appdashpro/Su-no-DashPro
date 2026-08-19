const fs = require('fs');
let file = 'src/components/TratamentosFormSection.tsx';
let code = fs.readFileSync(file, 'utf8');

// We will restore the local state to hold the string, and sync it with pesoAmostradoKg
code = code.replace(
  "// Removed manualWeight state",
  "  const [localWeightStr, setLocalWeightStr] = useState<string>('');\n  useEffect(() => {\n    if (pesoAmostradoKg !== undefined) {\n      if (parseFloat(localWeightStr) !== pesoAmostradoKg) {\n        setLocalWeightStr(String(pesoAmostradoKg));\n      }\n    }\n  }, [pesoAmostradoKg]);"
);

code = code.replace(
  `  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const newWeight = val === '' ? undefined : parseFloat(val);
    if (onPesoChange) onPesoChange(newWeight);
    const effectiveNewWeight = newWeight !== undefined ? newWeight : pesoEstimadoCurve;`,
  `  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalWeightStr(val);
    const newWeight = val === '' ? undefined : parseFloat(val);
    if (onPesoChange && !isNaN(newWeight as number)) onPesoChange(newWeight);
    else if (onPesoChange && val === '') onPesoChange(undefined);
    const effectiveNewWeight = !isNaN(newWeight as number) && newWeight !== undefined ? newWeight : pesoEstimadoCurve;`
);

code = code.replace(
  "value={pesoAmostradoKg === undefined && pesoEstimadoCurve > 0 ? pesoEstimadoCurve.toFixed(2) : (pesoAmostradoKg || '')}",
  "value={pesoAmostradoKg === undefined && pesoEstimadoCurve > 0 ? pesoEstimadoCurve.toFixed(2) : localWeightStr}"
);

fs.writeFileSync(file, code);
console.log("Fixed weight input issue");
