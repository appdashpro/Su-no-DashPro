const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://cnemtndccfppibecjuep.supabase.co', 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj');

async function check() {
  const { data, error } = await supabase.from('usuarios').select('*');
  console.log("Usuarios:", data);
}
check();
