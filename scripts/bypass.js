import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cnemtndccfppibecjuep.supabase.co';
const supabaseKey = 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('usuarios').upsert({
      id: 'f677f168-07b6-4db7-a601-99eda334ff74',
      auth_uid: 'f677f168-07b6-4db7-a601-99eda334ff74',
      empresa_id: '00000000-0000-0000-0000-000000000001',
      email: 'rogerfrancescon@gmail.com',
      nome: 'rogerfrancescon',
      ativo: true
  });
  console.log('Error:', error);
}

test()
