import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cnemtndccfppibecjuep.supabase.co';
const supabaseKey = 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: registros } = await supabase.from('registros').select('*');
  const { data: lotes } = await supabase.from('lotes').select('*');
  const { data: integrados } = await supabase.from('integrados').select('*');
  
  if (!registros || !lotes || !integrados) {
    console.error("Failed to fetch data");
    return;
  }
  
  console.log(`Found ${lotes.length} lotes.`);
  
  let updatedCount = 0;
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
      const validReg = regs.find(r => r['Animais Alojados'] > 0);
      if (validReg) {
        const num = parseInt(validReg['Animais Alojados'], 10);
        if (num !== lote.animais_alojados) {
          console.log(`Updating lote ${int.nome} (${lote.id}) from ${lote.animais_alojados} to ${num}`);
          await supabase.from('lotes').update({ animais_alojados: num }).eq('id', lote.id);
          updatedCount++;
        }
      }
    }
  }
  console.log(`Updated ${updatedCount} lotes.`);
}
run();
