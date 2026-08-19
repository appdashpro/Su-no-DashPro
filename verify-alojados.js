import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cnemtndccfppibecjuep.supabase.co';
const supabaseKey = 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Iniciando login...");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'wagner_galvan@cargill.com',
    password: 'senha_teste_123'
  });
  
  if (authError) {
    console.error("Erro de login:", authError.message);
    return;
  }
  console.log("Login com sucesso, token obtido.");

  const { data: registros } = await supabase.from('registros').select('*');
  const { data: lotes } = await supabase.from('lotes').select('*').limit(9999);
  const { data: integrados } = await supabase.from('integrados').select('*').limit(9999);
    
  if (!registros) console.log("Registros não retornaram");
  if (!lotes) console.log("Lotes não retornaram");
  
  console.log(`Registros: ${registros?.length}, Lotes: ${lotes?.length}, Integrados: ${integrados?.length}`);

  let match = 0;
  let mismatch = 0;
  let mismatchesDetails = [];
    
  for (const lote of (lotes || [])) {
    const int = (integrados || []).find(i => i.id === lote.integrado_id);
    if (!int) continue;
        
    const loteName = int.nome.toLowerCase().trim();
    const loteAloj = lote.data_alojamento;
        
    const regs = (registros || []).filter(r => 
      r.Integrado && r.Integrado.toLowerCase().trim() === loteName &&
      r.Alojamento === loteAloj
    );
        
    if (regs.length > 0) {
      const regValue = regs.find(r => r['Animais Alojados'] > 0)?.['Animais Alojados'];
      if (regValue && regValue !== lote.animais_alojados) {
          mismatchesDetails.push(`MISMATCH ${int.nome} (${loteAloj}): tabela lotes = ${lote.animais_alojados}, tabela registros = ${regValue}`);
          mismatch++;
      } else {
          match++;
      }
    }
  }
  console.log(`Matched: ${match}, Mismatched: ${mismatch}`);
  mismatchesDetails.slice(0, 10).forEach(msg => console.log(msg));
}
run();
