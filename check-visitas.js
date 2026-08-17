import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://cnemtndccfppibecjuep.supabase.co', 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj');
async function run() {
  const { data: cols } = await supabase.rpc('get_columns', { table_name: 'visitas' });
  console.log("Cols via rpc might fail, let's just select 1 row", cols);
  const { data: v } = await supabase.from('visitas').select('*').limit(1);
  console.log(v);
}
run();
