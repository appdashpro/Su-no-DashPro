const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://cnemtndccfppibecjuep.supabase.co';
const supabaseKey = 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.from('usuarios').select('id, email, papel, empresa_id, clientes_permitidos');
  if (error) console.error('Error:', error);
  else console.log(JSON.stringify(data, null, 2));
}
main();
