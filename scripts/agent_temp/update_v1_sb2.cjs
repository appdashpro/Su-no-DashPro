const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function updateSupabase() {
  const supabase = createClient("https://cnemtndccfppibecjuep.supabase.co", "sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj");
  
  let tsCode = fs.readFileSync('src/data.ts', 'utf8');
  let v1Match = tsCode.match(/const growthCurveV1: GrowthCurvePoint\[\] = (\[[\s\S]*?\]);/);
  let v1MetasMatch = tsCode.match(/const defaultMetasV1 = (\{[\s\S]*?\});/);
  
  let curveObj = eval(v1Match[1]);
  let metasV1 = eval(`(${v1MetasMatch[1]})`);

  const EMPRESA_ID = '00000000-0000-0000-0000-000000000001'; 
  const { data: config } = await supabase.from('empresa_configuracoes').select('*').eq('empresa_id', EMPRESA_ID).single();
  
  if (config && config.curva_desempenho) {
    let updated = false;
    for (let i=0; i < config.curva_desempenho.length; i++) {
        let c = config.curva_desempenho[i];
        if ((c.version === 'v1' || (c.nome && c.nome.includes('V1')))) {
            // we will update all V1 curves with this baseline for now, or just Misto?
            // The provided one is definitely Misto.
            if (c.nome && c.nome.includes('Misto')) {
               config.curva_desempenho[i].curve = curveObj;
               config.curva_desempenho[i].metas = metasV1;
               updated = true;
            }
        }
    }
    if (updated) {
       const { error } = await supabase.from('empresa_configuracoes').update({
          curva_desempenho: config.curva_desempenho
       }).eq('empresa_id', EMPRESA_ID);
       
       if (error) console.error(error);
       else console.log('Supabase successfully updated for Pastre V1 Misto!');
    }
  }
}
updateSupabase().then(() => process.exit(0));
