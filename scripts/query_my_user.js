import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cnemtndccfppibecjuep.supabase.co';
const supabaseKey = 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj';

async function test() {
  const response = await fetch(`${supabaseUrl}/rest/v1/usuarios?select=id,empresa_id&id=eq.f677f168-07b6-4db7-a601-99eda334ff74`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  })
  
  const data = await response.json();
  console.log('Data:', data);
}
test()
