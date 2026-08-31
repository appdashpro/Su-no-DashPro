const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function seed() {
  const supabase = createClient('https://cnemtndccfppibecjuep.supabase.co', 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj');
  const { data: configs } = await supabase.from('empresa_configuracoes').select('*');
  const { data: empresas } = await supabase.from('empresas').select('*');

  // We need to read the ts files... actually it's easier to just compile a small ts script to do this because of imports.
}
seed();
