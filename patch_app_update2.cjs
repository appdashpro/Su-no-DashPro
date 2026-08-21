const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /const handleUpdateIntegrado = async \(integrado: Integrado\) => \{[\s\S]*?\.eq\('id', integrado\.id\);[\s\S]*?if \(error\) \{[\s\S]*?console\.error\('Erro ao atualizar lote no Supabase:', error\);/m;

const match = code.match(regex);
if (match) {
  code = code.replace(regex, `const handleUpdateIntegrado = async (integrado: Integrado) => {
    try {
      let syncFailed = false;
      if (isOnline) {
        const { error } = await supabase
          .from('lotes')
          .update({
            data_alojamento: integrado.alojamentoDate,
            status: integrado.status === 'Em andamento' ? 'Ativo' : 'Encerrado',
            empresa_id: integrado.empresaId
          })
          .eq('id', integrado.id);
        
        if (error) {
          console.error('Erro ao atualizar lote no Supabase. Detalhes:', JSON.stringify(error, null, 2));`);
  fs.writeFileSync('src/App.tsx', code, 'utf8');
  console.log("Replaced");
} else {
  console.log("No match");
}
