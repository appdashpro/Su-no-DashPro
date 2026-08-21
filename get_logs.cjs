const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://cnemtndccfppibecjuep.supabase.co', 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj');

async function check() {
  const { data: iData, error: iErr } = await supabase.from('integrados').select('*').order('created_at', { ascending: false }).limit(5);
  console.log("Recent Integrados:", iData);

  const { data: lData, error: lErr } = await supabase.from('lotes').select('*').order('created_at', { ascending: false }).limit(5);
  console.log("Recent Lotes:", lData);

  const { data: vData, error: vErr } = await supabase.from('visitas').select('*').order('created_at', { ascending: false }).limit(5);
  console.log("Recent Visitas:", vData);
}
check();
