const { createClient } = require('@supabase/supabase-js');
const sb = createClient('https://cnemtndccfppibecjuep.supabase.co', process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj');
async function run() {
  const { data: authData, error: authError } = await sb.auth.signInWithPassword({
    email: 'rogerfrancescon@gmail.com',
    password: 'senha' // I don't know the password
  });
  console.log(authError ? authError.message : 'logged in');
}
run();
