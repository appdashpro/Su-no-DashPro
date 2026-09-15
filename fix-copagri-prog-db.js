import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://cnemtndccfppibecjuep.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (supabaseUrl && supabaseKey) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  supabase.from('empresa_configuracoes').select('*').then(async ({ data }) => {
    if (!data) return;
    for (const config of data) {
       let curvas = config.curva_desempenho;
       if (!curvas || !Array.isArray(curvas)) continue;
       
       let changed = false;
       for (const c of curvas) {
          if (c.id === 'copagri') {
              c.programa_alimentar = [
                { racao: 'Alojamento', dia_inicio: 1, dia_fim: 14 },
                { racao: 'Crescimento 1', dia_inicio: 15, dia_fim: 38 },
                { racao: 'Crescimento 2', dia_inicio: 39, dia_fim: 52 },
                { racao: 'Crescimento 3', dia_inicio: 53, dia_fim: 76 },
                { racao: 'Terminação 1', dia_inicio: 77, dia_fim: 90 },
                { racao: 'Terminação 2', dia_inicio: 91, dia_fim: 112 }
              ];
              changed = true;
          }
       }
       
       if (changed) {
          const { error } = await supabase.from('empresa_configuracoes').update({ curva_desempenho: curvas }).eq('id', config.id);
          if (error) {
              console.error('Error updating config', config.id, error);
          } else {
              console.log('Successfully updated Copagri for', config.id);
          }
       }
    }
  });
}
