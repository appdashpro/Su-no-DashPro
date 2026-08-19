import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cnemtndccfppibecjuep.supabase.co';
const supabaseKey = 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj';

async function test() {
  const table = process.argv[2]
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?limit=1`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  })
  
  const data = await response.json();
  if (data && data.length > 0) {
      console.log(Object.keys(data[0]));
  } else {
      console.log("No data or error:", data);
  }
}
test()
