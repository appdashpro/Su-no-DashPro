import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cnemtndccfppibecjuep.supabase.co';
const supabaseKey = 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'rogerfrancescon@gmail.com',
    password: 'password123'
  });
  
  if (authError) {
    console.log('Auth Error:', authError.message);
    return;
  }
  console.log('Logged in!');
  
  const { data, error } = await supabase
    .from('usuarios')
    .select('*');
    
  console.log('Users:', data);
  if (error) console.error(error);
}

test();
