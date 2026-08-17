const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://cnemtndccfppibecjuep.supabase.co';
const supabaseKey = 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('usuarios').insert({
    email: 'test_insert@example.com',
    nome: 'Test',
    papel: 'TECNICO_CLIENTE',
    auth_uid: '00000000-0000-0000-0000-000000000000'
  }).select();
  console.log(error || data);
}
test();
