const { createClient } = require('@supabase/supabase-js');
const url = 'https://cnemtndccfppibecjuep.supabase.co';
const key = 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj';
const sb = createClient(url, key);

async function run() {
  const { data: vData } = await sb.from('visitas').select('id, cargas_racao!fk_carg_visita(id)').limit(1);
  if (vData && vData.length) {
     console.log(Object.keys(vData[0]));
  }
}
run();
