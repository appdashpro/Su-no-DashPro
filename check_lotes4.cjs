const { createClient } = require('@supabase/supabase-js');
const url = 'https://cnemtndccfppibecjuep.supabase.co';
const key = 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj';
const sb = createClient(url, key);

async function run() {
  const { data: lotes, error } = await sb.from('lotes').select('id, data_alojamento, status, integrados(nome), empresas(nome)');
  if (error) {
     console.log("Error:", error);
  } else if (lotes) {
      console.log(`Total lotes: ${lotes.length}`);
      lotes.forEach(l => {
         const age = Math.floor((new Date() - new Date(l.data_alojamento)) / (1000 * 60 * 60 * 24));
         console.log(`Lote ${l.id} - ${l.integrados?.nome} (Emp: ${l.empresas?.nome}) - Idade: ${age} - Status: ${l.status}`);
      });
  }
}
run();
