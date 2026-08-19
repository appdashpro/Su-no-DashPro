import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cnemtndccfppibecjuep.supabase.co';
const supabaseKey = 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.rpc('admin_update_user_credentials', { 
      target_user_id: 'f677f168-07b6-4db7-a601-99eda334ff74', 
      new_password: 'Password123!',
      target_email: 'rogerfrancescon@gmail.com'
  });
  console.log('Error:', error);
  console.log('Data:', data);
}

test()
