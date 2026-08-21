const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://cnemtndccfppibecjuep.supabase.co', 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj');

async function check() {
  const { data, error } = await supabase.from('visitas').select('*').gte('created_at', '2026-08-20T00:00:00Z');
  console.log("Visitas today:", data, error);
}
check();
