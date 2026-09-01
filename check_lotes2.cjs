const { createClient } = require('@supabase/supabase-js');
const url = 'https://cnemtndccfppibecjuep.supabase.co';
const key = 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj';
const sb = createClient(url, key);

async function run() {
  const { data: intData } = await sb.from('integrados').select('*').ilike('nome', '%pastre%');
  if (intData && intData.length) {
    console.log("Found integrado:", intData.map(i => i.nome).join(", "));
  } else {
    console.log("Integrado pastre not found");
  }
}
run();
