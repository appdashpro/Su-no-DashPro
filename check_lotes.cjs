const { createClient } = require('@supabase/supabase-js');
const url = 'https://cnemtndccfppibecjuep.supabase.co';
const key = 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj';
const sb = createClient(url, key);

async function run() {
  const { data: empData } = await sb.from('empresas').select('*').ilike('nome', '%pastre%');
  if (empData && empData.length) {
    console.log("Found empresa:", empData[0].nome);
    const { data: lotes } = await sb.from('lotes').select('id, data_alojamento, status, data_abate, integrados(nome)').eq('empresa_id', empData[0].id);
    if (lotes) {
        lotes.forEach(l => {
           const age = Math.floor((new Date() - new Date(l.data_alojamento)) / (1000 * 60 * 60 * 24));
           console.log(`Lote ${l.id} - ${l.integrados?.nome} - Idade: ${age} - Status: ${l.status} - Data abate: ${l.data_abate}`);
        });
    }
  } else {
     console.log("Empresa pastre not found");
  }
}
run();
