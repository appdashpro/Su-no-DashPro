const { createClient } = require('@supabase/supabase-js');
const sb = createClient('https://cnemtndccfppibecjuep.supabase.co', 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj');
async function run() {
  const { data, error } = await sb.auth.signUp({
    email: 'test@gmail.com',
    password: 'password123'
  });
  console.log('Signup error:', error?.message);
}
run();
