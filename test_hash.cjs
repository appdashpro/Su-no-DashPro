const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.example' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://cnemtndccfppibecjuep.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'rogerfrancescon@gmail.com',
    password: 'password123'
  });
  console.log("Auth error:", error ? error.message : "Success");
}
test();
