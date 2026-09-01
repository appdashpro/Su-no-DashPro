const { createClient } = require('@supabase/supabase-js');
const url = 'https://cnemtndccfppibecjuep.supabase.co';
const key = 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj';
const sb = createClient(url, key);

async function run() {
  const { data: vData, error: vErr } = await sb.from('visitas').select('*, tratamentos(*)').limit(1);
  if (vErr) console.log(JSON.stringify(vErr, null, 2));
}
run();
