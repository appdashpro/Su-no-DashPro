import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// read env manually since Vite's loadEnv might not be available or we can just parse .env
let envStr = fs.readFileSync('.env', 'utf8');
const SUPABASE_URL = envStr.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim();
const SUPABASE_KEY = envStr.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  console.log("Searching for Copagri...");
  const { data: empresas, error: err1 } = await supabase.from('empresas').select('*').ilike('nome', '%Copagri%');
  if (err1) {
    console.error("Error fetching empresas:", err1);
    return;
  }
  console.log("Found empresas:", empresas?.map(e => ({ id: e.id, nome: e.nome, ativo: e.ativo })));

  if (empresas && empresas.length > 0) {
    for (const e of empresas) {
      const { data: config, error: err2 } = await supabase.from('empresa_configuracoes').select('empresa_id, tipo_calculo_curva, meta_mortalidade').eq('empresa_id', e.id);
      if (err2) {
        console.error("Error fetching config for", e.nome, err2);
      } else {
        console.log(`Config for ${e.nome}:`, config);
      }
      
      const { data: fullConfig } = await supabase.from('empresa_configuracoes').select('curva_desempenho').eq('empresa_id', e.id).single();
      if (fullConfig && fullConfig.curva_desempenho) {
         console.log(`Curva Desempenho items for ${e.nome}:`, fullConfig.curva_desempenho.map(c => ({ id: c.id, _type: c._type, nome: c.nome })));
      } else {
         console.log(`No curva_desempenho data for ${e.nome}`);
      }
    }
  }
}

run();
