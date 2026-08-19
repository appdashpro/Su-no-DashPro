const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.example' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://cnemtndccfppibecjuep.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Supabase initialized");
}
test();
