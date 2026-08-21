const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://cnemtndccfppibecjuep.supabase.co', 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj');

async function check() {
  const { data, error } = await supabase.rpc('get_foreign_keys');
  console.log("FKs if exists");
  
  // Or just query the DB for schema info using PostgREST if exposed, but we can't easily.
  // We can insert a row and see the exact error!
}
check();
