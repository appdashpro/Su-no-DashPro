const { createClient } = require('@supabase/supabase-js');
const url = 'https://cnemtndccfppibecjuep.supabase.co';
const key = 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj';
const sb = createClient(url, key);

async function run() {
  const { data: vData, error: vErr } = await sb.from('visitas').select('*, cargas_racao(*), tratamentos(*)').limit(1);
  console.log("Visitas fetch:", vErr ? vErr.message : "Success, records: " + (vData ? vData.length : 0));
  if (vErr) console.log(vErr);
  
  const { data: cData, error: cErr } = await sb.from('cargas_racao').select('*').limit(1);
  console.log("Cargas fetch:", cErr ? cErr.message : "Success, records: " + (cData ? cData.length : 0));
}
run();
