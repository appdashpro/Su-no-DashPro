const fs = require('fs');
const path = './src/components/ReferenceCurve.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
`  const handleMetaChange = (field: string, value: number) => {
    setEditableMetas({ ...editableMetas, [field]: value });
  };`,
`  const handleMetaChange = (field: string, value: number) => {
    const newMetas = { ...editableMetas, [field]: value };
    newMetas.metaAcumulada = (newMetas.metaAlojamento || 0) + (newMetas.metaCrescimento1 || 0) + (newMetas.metaCrescimento2 || 0) + (newMetas.metaCrescimento3 || 0) + (newMetas.metaTerminacao1 || 0) + (newMetas.metaTerminacao2 || 0);
    setEditableMetas(newMetas);
  };`
);

fs.writeFileSync(path, content);
