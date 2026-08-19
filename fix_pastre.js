require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const EMPRESA_ID = '00000000-0000-0000-0000-000000000001';
  // Restore the name in the database
  const { data, error } = await supabase.from('empresas').update({ nome: 'Rações Pastre' }).eq('id', EMPRESA_ID);
  if (error) console.error('Error updating:', error);
  else console.log('Successfully reverted name to Rações Pastre in database.');
}
main();
