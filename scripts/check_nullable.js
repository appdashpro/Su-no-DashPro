import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cnemtndccfppibecjuep.supabase.co';
const supabaseKey = 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('visitas').insert({
      empresa_id: '00000000-0000-0000-0000-000000000001',
      lote_id: '00000000-0000-0000-0000-000000000000',
      usuario_id: null,
      data_visita: '2023-01-01',
      mortalidade_periodo: 0,
      descartes_periodo: 0
  });
  console.log('Error:', error);
}

test()
