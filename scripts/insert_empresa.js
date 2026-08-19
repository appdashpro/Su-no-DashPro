import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cnemtndccfppibecjuep.supabase.co';
const supabaseKey = 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('empresas').insert({
    id: '00000000-0000-0000-0000-000000000001',
    nome: 'Empresa Padrão',
    cnpj: '00.000.000/0000-00'
  });
  console.log('Error:', error);
  console.log('Data:', data);
}

test()
