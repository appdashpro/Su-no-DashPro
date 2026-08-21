const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://cnemtndccfppibecjuep.supabase.co', 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj');
async function run() {
  const { data, error } = await supabase.from('usuarios').select('*').eq('id', '910e47b0-22c9-497e-9eaa-0816d7fce6d4');
  console.log(data);
}
run();
