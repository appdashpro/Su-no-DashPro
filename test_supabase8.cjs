const { createClient } = require('@supabase/supabase-js');
const url = 'https://cnemtndccfppibecjuep.supabase.co';
const key = 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj';
const sb = createClient(url, key);

async function run() {
  const { data: auth, error: authErr } = await sb.auth.signInWithPassword({
    email: 'rogerfrancescon@gmail.com',
    password: 'password123' // I'll just use a wrong password and it will fail.
  });
  console.log(authErr ? authErr.message : "Logged in");
}
run();
