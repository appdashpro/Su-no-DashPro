const { createClient } = require('@supabase/supabase-js');
const url = 'https://cnemtndccfppibecjuep.supabase.co';
const key = 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj';
const sb = createClient(url, key);

async function run() {
  const { data: cData, error: cErr } = await sb.from('visita_entregas').select('*').limit(1);
  if (cErr) console.log(JSON.stringify(cErr, null, 2));
  else console.log("Success visita_entregas columns: " + (cData && cData.length ? Object.keys(cData[0]).join(", ") : "Empty table"));
}
run();
