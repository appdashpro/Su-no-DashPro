import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cnemtndccfppibecjuep.supabase.co';
const supabaseKey = 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj';

async function test() {
  const response = await fetch(`${supabaseUrl}/rest/v1/?apikey=${supabaseKey}`)
  const data = await response.json()
  
  if (data && data.definitions && data.definitions.usuarios) {
      console.log('Usuarios properties:', data.definitions.usuarios.properties);
  } else {
      console.log('No schema found for usuarios');
  }
}
test()
