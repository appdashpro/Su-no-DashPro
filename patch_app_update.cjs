const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  `  const handleUpdateIntegrado = async (integrado: Integrado) => {
    try {
      let syncFailed = false;
      if (isOnline) {
        const { error } = await supabase
          .from('lotes')
          .update({
            data_alojamento: integrado.alojamentoDate,
            status: integrado.status === 'Em andamento' ? 'Ativo' : 'Encerrado',
            
          })
          .eq('id', integrado.id);
        
        if (error) {
          console.error('Erro ao atualizar lote no Supabase:', error);`,
  `  const handleUpdateIntegrado = async (integrado: Integrado) => {
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
          console.error('Erro ao atualizar lote no Supabase. Detalhes:', JSON.stringify({ message: error.message, details: error.details, hint: error.hint, code: error.code }, null, 2));`
);

fs.writeFileSync('src/App.tsx', code, 'utf8');
