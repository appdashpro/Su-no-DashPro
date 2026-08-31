const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function updateSupabase() {
  const supabaseUrl = "https://cnemtndccfppibecjuep.supabase.co";
  const supabaseKey = "sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj";
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Read curve from data.ts
  let tsCode = fs.readFileSync('src/data.ts', 'utf8');
  let v1Match = tsCode.match(/const growthCurveV1: GrowthCurvePoint\[\] = (\[[\s\S]*?\]);/);
  let v1MetasMatch = tsCode.match(/const defaultMetasV1 = (\{[\s\S]*?\});/);
  
  if (!v1Match || !v1MetasMatch) {
     console.error("Could not parse data.ts");
     return;
  }
  
  let curveObj;
  let metasV1;
  try {
     curveObj = eval(v1Match[1]);
     metasV1 = eval(`(${v1MetasMatch[1]})`);
  } catch (e) {
     console.error("Eval error", e);
     return;
  }

  const EMPRESA_ID = '00000000-0000-0000-0000-000000000001'; // Pastre
  const { data: config } = await supabase.from('empresa_configuracoes').select('*').eq('empresa_id', EMPRESA_ID).single();
  
  if (config && config.curva_desempenho) {
    const v1Index = config.curva_desempenho.findIndex(c => c.version === 'v1');
    if (v1Index !== -1) {
       config.curva_desempenho[v1Index].curve = curveObj;
       config.curva_desempenho[v1Index].metas = metasV1;
       
       const { error } = await supabase.from('empresa_configuracoes').update({
          curva_desempenho: config.curva_desempenho
       }).eq('empresa_id', EMPRESA_ID);
       
       if (error) {
         console.error('Failed to update Supabase:', error);
       } else {
         console.log('Supabase successfully updated for Pastre V1!');
       }
    } else {
       console.log('V1 not found in config.curva_desempenho');
    }
  } else {
     console.log('Pastre config not found');
  }
}

updateSupabase().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
