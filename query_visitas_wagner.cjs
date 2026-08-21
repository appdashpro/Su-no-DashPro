const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://cnemtndccfppibecjuep.supabase.co', 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj');
async function run() {
  const { data, error } = await supabase.from('visitas').select('*').eq('usuario_id', '3a2bd791-821c-49aa-ad63-193837432ce5');
  console.log(data);
}
run();
