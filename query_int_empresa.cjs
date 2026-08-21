const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://cnemtndccfppibecjuep.supabase.co', 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj');

async function check() {
  const { data, error } = await supabase.from('integrados').select('id, empresa_id, nome').eq('id', '64cbdcc5-40f8-4fc7-86f5-769b249f2ab9');
  console.log("Integrado:", data);
}
check();
