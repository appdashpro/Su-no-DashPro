import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cnemtndccfppibecjuep.supabase.co';
const supabaseKey = 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj';

async function test() {
  const response = await fetch(`${supabaseUrl}/rest/v1/usuarios?limit=1`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  })
  
  const data = await response.json();
  if (data && data.length > 0) {
      console.log(data[0]);
  } else {
      console.log("No data or error:", data);
  }
}
test()
