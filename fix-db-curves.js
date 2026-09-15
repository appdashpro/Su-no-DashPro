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
       
       const uniqueCurvas = [];
       const seen = new Set();
       
       curvas.sort((a, b) => {
          const aId = a.id || '';
          const bId = b.id || '';
          const aSys = aId.includes('pastre') || aId.includes('copagri') || aId.includes('bugio') || aId.includes('btz');
          const bSys = bId.includes('pastre') || bId.includes('copagri') || bId.includes('bugio') || bId.includes('btz');
          if (aSys && !bSys) return -1;
          if (!aSys && bSys) return 1;
          return 0;
       });
       
       for (const c of curvas) {
          const tl = String(c.tipoLote || 'Misto').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
          const key = c.dataVigencia + '-' + tl;
          if (!seen.has(key)) {
             seen.add(key);
             uniqueCurvas.push(c);
          } else {
             changed = true;
             console.log(`Removing duplicate for ${config.empresa_id}: ${key} (id: ${c.id})`);
          }
       }
       
       if (changed) {
          const { error } = await supabase.from('empresa_configuracoes').update({ curva_desempenho: uniqueCurvas }).eq('id', config.id);
          if (error) {
              console.error('Error updating config', config.id, error);
          } else {
              console.log('Successfully deduped config for', config.id);
          }
       }
    }
  });
}
