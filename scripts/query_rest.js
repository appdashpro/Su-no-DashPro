import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cnemtndccfppibecjuep.supabase.co';
const supabaseKey = 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('usuarios').select('id, auth_uid, email, empresa_id');
  console.log('Error:', error);
  console.log('Data count:', data?.length);
  console.log('Data:', data);
}

test()
