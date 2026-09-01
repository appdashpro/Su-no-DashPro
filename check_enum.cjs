const { createClient } = require('@supabase/supabase-js');
const url = 'https://cnemtndccfppibecjuep.supabase.co';
const key = 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj';
const sb = createClient(url, key);

async function run() {
  const { data, error } = await sb.rpc('exec_sql', { sql_query: "SELECT unnest(enum_range(NULL::lote_status))::text;" });
  console.log('Result:', data, 'Error:', error);
}
run();
