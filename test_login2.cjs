const { createClient } = require('@supabase/supabase-js');
const sb = createClient('https://cnemtndccfppibecjuep.supabase.co', 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj');
async function run() {
  const { data, error } = await sb.auth.signInWithPassword({
    email: 'rogerfrancescon@gmail.com',
    password: 'wrong_password'
  });
  console.log('Login error:', error?.message, error?.status);
}
run();
