import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL || 'https://cnemtndccfppibecjuep.supabase.co', process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);
supabase.from('empresa_configuracoes').select('*').then(({ data }) => {
  const pastre = data.find(d => JSON.stringify(d).toLowerCase().includes('pastre'));
  if (pastre) {
    console.log(pastre.curva_desempenho.map(c => ({ id: c.id, data: c.dataVigencia, tipo: c.tipoLote, nome: c.nome })));
  }
});
