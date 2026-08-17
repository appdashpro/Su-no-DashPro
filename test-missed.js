import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cnemtndccfppibecjuep.supabase.co';
const supabaseKey = 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: registros } = await supabase.from('registros').select('*');
  const { data: lotes } = await supabase.from('lotes').select('*');
  const { data: integrados } = await supabase.from('integrados').select('*');
  
  let missed = 0;
  for (const lote of lotes) {
    const int = integrados.find(i => i.id === lote.integrado_id);
    if (!int) continue;
    
    const loteName = int.nome.toLowerCase().trim();
    const loteAloj = lote.data_alojamento;
    
    const regs = registros.filter(r => 
      r.Integrado && r.Integrado.toLowerCase().trim() === loteName &&
      r.Alojamento === loteAloj
    );
    
    if (regs.length === 0) {
      console.log(`NO MATCH FOR: ${int.nome} (${loteAloj})`);
      missed++;
    } else {
      const validReg = regs.find(r => r['Animais Alojados'] > 0);
      if (!validReg) {
         console.log(`MATCHED BUT NO ANIMAIS ALOJADOS FOR: ${int.nome} (${loteAloj})`);
         missed++;
      }
    }
  }
  console.log(`Missed ${missed} lotes`);
}
run();
