import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://cnemtndccfppibecjuep.supabase.co', 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj');

async function run() {
  console.log("--- Tabela 'registros' (Original) ---");
  const { data: registros } = await supabase.from('registros').select('*').limit(2);
  if (registros && registros.length > 0) {
     console.log(Object.keys(registros[0]));
     console.log(registros[0]);
  } else {
     console.log("Tabela registros vazia ou inexistente.");
  }

  console.log("\n--- Tabela 'lotes' (Atual) ---");
  const { data: lotes } = await supabase.from('lotes').select('*').limit(2);
  if (lotes && lotes.length > 0) {
     console.log(Object.keys(lotes[0]));
     console.log(lotes[0]);
  } else {
     console.log("Tabela lotes vazia.");
  }
}
run();
