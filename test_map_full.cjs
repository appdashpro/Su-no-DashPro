const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://cnemtndccfppibecjuep.supabase.co', 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj');

async function test() {
  const { data: integradosDB } = await supabase.from('integrados').select('*').range(0, 9999);
  const { data: lotesDB } = await supabase.from('lotes').select('*').range(0, 9999);
  const { data: visitasDB } = await supabase.from('visitas').select('*').gte('data_visita', '2026-08-28');
  const mappedVisits = (visitasDB || []).map(v => {
    const lote = lotesDB?.find(l => l.id === v.lote_id);
    const integrado = integradosDB?.find(i => i.id === lote?.integrado_id || i.id === v.integrado_id);
    return {
      id: v.id, date: v.data_visita, lote: lote?.id, integrado: integrado?.id, nome: integrado?.nome
    };
  });
  console.log(mappedVisits);
}
test();
