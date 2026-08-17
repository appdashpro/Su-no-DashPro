const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://cnemtndccfppibecjuep.supabase.co';
const supabaseKey = 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const email = 'wagner_galvan@cargill.com';
  const password = 'senha_teste_123';
  
  let { data, error } = await supabase.auth.signInWithPassword({ email, password });
  console.log('SignIn:', error ? error.message : 'Success');
  
  if (error && error.message.includes('Invalid login credentials')) {
    console.log('Attempting SignUp...');
    const { data: suData, error: suErr } = await supabase.auth.signUp({ email, password });
    console.log('SignUp:', suErr ? suErr.message : 'Success');
  }
}
test();
