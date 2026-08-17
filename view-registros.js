import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://cnemtndccfppibecjuep.supabase.co', 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj');
async function run() {
  const { data: v } = await supabase.from('registros').select('*').limit(2);
  console.log(v);
}
run();
