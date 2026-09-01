const { createClient } = require('@supabase/supabase-js');
const url = 'https://cnemtndccfppibecjuep.supabase.co';
const key = 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj';
const sb = createClient(url, key);

async function run() {
  const { data: cols } = await sb.rpc('get_enum_values', { enum_name: 'lote_status' });
  // check columns of integrados
  const { data: cols2, error } = await sb.from('integrados').select('*').limit(1);
  if (cols2) {
      console.log(Object.keys(cols2[0]));
  }
}
run();
