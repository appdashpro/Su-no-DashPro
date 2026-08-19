import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cnemtndccfppibecjuep.supabase.co';
const supabaseKey = 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'rogerfrancescon@gmail.com',
      password: 'Password123!'
  });
  console.log('Login Error:', authError);
  if (authError) return;
  
  console.log('Logged in as:', authData.user.id);

  const { data: eData, error: eError } = await supabase.from('empresas').upsert({
    id: '00000000-0000-0000-0000-000000000001',
    nome: 'Empresa Padrão',
    cnpj: '00.000.000/0000-00'
  });
  console.log('Empresa Upsert Error:', eError);

  const { data: uData, error: uError } = await supabase.from('usuarios').upsert({
    id: authData.user.id,
    auth_uid: authData.user.id,
    empresa_id: '00000000-0000-0000-0000-000000000001',
    email: 'rogerfrancescon@gmail.com',
    nome: 'rogerfrancescon',
    ativo: true,
    papel: 'MASTER'
  });
  console.log('Usuario Upsert Error:', uError);
}

test()
