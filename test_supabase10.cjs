const { createClient } = require('@supabase/supabase-js');
const url = 'https://cnemtndccfppibecjuep.supabase.co';
const key = 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj';
const sb = createClient(url, key);

async function run() {
  const { data: configsDB, error: configError } = await sb.from("empresa_configuracoes").select("*");
  if (configError) console.log(JSON.stringify(configError, null, 2));
  else console.log("Success configsDB length: " + (configsDB ? configsDB.length : 0));
}
run();
