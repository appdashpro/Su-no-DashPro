const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://cnemtndccfppibecjuep.supabase.co', 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj');

async function test() {
  const { data, error } = await supabase.from('visitas').upsert({
    id: 'b149b084-25e1-4f9e-990a-f0fbfdf66755',
    empresa_id: '00000000-0000-0000-0000-000000000002', // Bugio
    lote_id: 'e93bfff8-a9e1-41e0-b68b-2b8bfa883476', // Bugio lote
    usuario_id: '910e47b0-22c9-497e-9eaa-0816d7fce6d4', // Pastre admin
    data_visita: '2026-08-20',
    mortalidade_periodo: 0,
    descartes_periodo: 0
  });
  console.log("Upsert result:", error || data);
}
test();
