import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.example' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://cnemtndccfppibecjuep.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, email, auth_uid, nome');
    
  console.log('Users:', data);
  if (error) console.error(error);
}

test();
