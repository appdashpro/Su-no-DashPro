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
              if (c.metas.metaCrescimento3 !== 61.2 || c.metas.metaTerminacao1 !== 42.1 || c.metas.metaTerminacao2 !== 70.2) {
                  c.metas.metaCrescimento3 = 61.2;
                  c.metas.metaTerminacao1 = 42.1;
                  c.metas.metaTerminacao2 = 70.2;
                  changed = true;
              }
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
