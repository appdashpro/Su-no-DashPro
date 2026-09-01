const { createClient } = require('@supabase/supabase-js');
const url = 'https://cnemtndccfppibecjuep.supabase.co';
const key = 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj';
const sb = createClient(url, key);

async function run() {
  const { data: lotes } = await sb.from('lotes').select('status');
  if (lotes) {
     const statuses = new Set(lotes.map(l => l.status));
     console.log(Array.from(statuses));
  }
}
run();
