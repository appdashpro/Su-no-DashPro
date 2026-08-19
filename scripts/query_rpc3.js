import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cnemtndccfppibecjuep.supabase.co';
const supabaseKey = 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.auth.signUp({
      email: 'rogerfrancescon@gmail.com',
      password: 'Password123!'
  });
  console.log('Error:', error);
  console.log('User id:', data?.user?.id);
  
  if (data?.user?.id) {
    const { data: iData, error: iError } = await supabase.from('usuarios').upsert({
        id: data.user.id,
        auth_uid: data.user.id,
        empresa_id: '00000000-0000-0000-0000-000000000001',
        email: 'rogerfrancescon@gmail.com',
        nome: 'rogerfrancescon',
        ativo: true
    });
    console.log('Upsert Error:', iError);
  }
}

test()
