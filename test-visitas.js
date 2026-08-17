import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cnemtndccfppibecjuep.supabase.co';
const supabaseKey = 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: visitas, error } = await supabase.from('visitas').select('*').limit(1);
  console.log(visitas);
}
run();
