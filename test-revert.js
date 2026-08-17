import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://cnemtndccfppibecjuep.supabase.co', 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj');

async function run() {
  const { data: lote } = await supabase.from('lotes').select('animais_alojados').eq('id', 'b99abdc3-35c1-41ac-b042-6835f4449c54').single();
  console.log("Aquiles Mantovani lote currently has:", lote);
}
run();
