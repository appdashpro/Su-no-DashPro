const { createClient } = require('@supabase/supabase-js');
const url = 'https://cnemtndccfppibecjuep.supabase.co';
const key = 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj';
const sb = createClient(url, key);

async function run() {
  const { data: lotes } = await sb.from('lotes').select('*');
  const { data: integrados } = await sb.from('integrados').select('*');
  const { data: empresas } = await sb.from('empresas').select('*');
  
  if (lotes) {
      lotes.forEach(l => {
         const age = Math.floor((new Date() - new Date(l.data_alojamento)) / (1000 * 60 * 60 * 24));
         if (l.status === 'Encerrado' && age < 111) {
             const int = integrados.find(i => i.id === l.integrado_id);
             const emp = empresas.find(e => e.id === l.empresa_id);
             console.log(`Lote ${l.id} - Integrado: ${int?.nome} - Empresa: ${emp?.nome} - Idade: ${age} - Status: ${l.status}`);
         }
      });
  }
}
run();
