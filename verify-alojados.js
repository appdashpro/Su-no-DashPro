import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cnemtndccfppibecjuep.supabase.co';
const supabaseKey = 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: registros } = await supabase.from('registros').select('*');
  const { data: lotes } = await supabase.from('lotes').select('*');
  const { data: integrados } = await supabase.from('integrados').select('*');
  
  let match = 0;
  let mismatch = 0;
  
  for (const lote of lotes) {
    const int = integrados.find(i => i.id === lote.integrado_id);
    if (!int) continue;
    
    const loteName = int.nome.toLowerCase().trim();
    const loteAloj = lote.data_alojamento;
    
    const regs = registros.filter(r => 
      r.Integrado && r.Integrado.toLowerCase().trim() === loteName &&
      r.Alojamento === loteAloj
    );
    
    if (regs.length > 0) {
      const regValue = regs.find(r => r['Animais Alojados'] > 0)?.['Animais Alojados'];
      if (regValue && regValue !== lote.animais_alojados) {
          console.log(`MISMATCH ${int.nome}: lotes has ${lote.animais_alojados}, registros has ${regValue}`);
          mismatch++;
      } else {
          match++;
      }
    }
  }
  console.log(`Matched: ${match}, Mismatched: ${mismatch}`);
}
run();
