import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cnemtndccfppibecjuep.supabase.co';
const supabaseKey = 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: empresas, error } = await supabase.from('empresas').select('id, nome, alias');
  if (error) {
    console.error("Erro ao buscar empresas:", error);
    return;
  }
  console.log("Empresas na tabela:", empresas.length);
  console.log(JSON.stringify(empresas, null, 2));
}

check();
