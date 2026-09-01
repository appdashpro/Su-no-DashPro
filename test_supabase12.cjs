const { createClient } = require('@supabase/supabase-js');
const url = 'https://cnemtndccfppibecjuep.supabase.co';
const key = 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj';
const sb = createClient(url, key);

async function run() {
  const { data: configsDB } = await sb.from("empresa_configuracoes").select("*");
  if (configsDB) {
    configsDB.forEach(c => {
      console.log(`Empresa: ${c.empresa_id}, Curvas: ${c.curva_desempenho ? c.curva_desempenho.length : 'none'}`);
    });
  }
}
run();
