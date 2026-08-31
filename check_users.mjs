import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cnemtndccfppibecjuep.supabase.co';
const supabaseKey = 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: usuarios, error } = await supabase.from('usuarios').select('*');
  if (error) {
    console.error("Erro ao buscar usuarios:", error);
    return;
  }
  console.log("Usuarios na tabela:", usuarios.length);
  console.log(JSON.stringify(usuarios, null, 2));
}

check();
