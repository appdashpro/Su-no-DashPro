const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://cnemtndccfppibecjuep.supabase.co', 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj');

async function check() {
  console.log("Checking DB status...");
  
  const { data: iData, error: iErr } = await supabase.from('integrados').select('id, nome, empresa_id').order('created_at', { ascending: false }).limit(3);
  console.log("Latest Integrados:", iData);
  
  const { data: lData, error: lErr } = await supabase.from('lotes').select('id, integrado_id, empresa_id, status').order('created_at', { ascending: false }).limit(3);
  console.log("Latest Lotes:", lData);
}
check();
