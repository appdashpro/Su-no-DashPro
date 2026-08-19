import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cnemtndccfppibecjuep.supabase.co';
const supabaseKey = 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'rogerfrancescon@gmail.com',
    password: 'Password123!'
  });
  
  if (authError) {
      console.log('Auth Error:', authError);
      return;
  }
  
  const { data, error } = await supabase.from('usuarios').select('*');
  console.log('Error:', error);
  console.log('Data:', data);
}

test()
