const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

let tsCode = fs.readFileSync('src/data.ts', 'utf8');

// We need to swap growthCurveV1 and growthCurveV2 in data.ts.
// Actually, let's just parse both, and rewrite them swapped.
let v1Match = tsCode.match(/const growthCurveV1: GrowthCurvePoint\[\] = (\[[\s\S]*?\]);/);
let v1MetasMatch = tsCode.match(/const defaultMetasV1 = (\{[\s\S]*?\});/);
let v2Match = tsCode.match(/const growthCurveV2: GrowthCurvePoint\[\] = (\[[\s\S]*?\]);/);
let v2MetasMatch = tsCode.match(/const defaultMetasV2 = (\{[\s\S]*?\});/);

if (!v1Match || !v2Match) {
  console.log("Could not find curves");
  process.exit(1);
}

let v1CurveStr = v1Match[1];
let v1MetasStr = v1MetasMatch[1];
let v2CurveStr = v2Match[1];
let v2MetasStr = v2MetasMatch[1];

// Swap them in the source code
tsCode = tsCode.replace(v1Match[0], `const growthCurveV1: GrowthCurvePoint[] = ${v2CurveStr};`);
tsCode = tsCode.replace(v1MetasMatch[0], `const defaultMetasV1 = ${v2MetasStr};`);
tsCode = tsCode.replace(v2Match[0], `const growthCurveV2: GrowthCurvePoint[] = ${v1CurveStr};`);
tsCode = tsCode.replace(v2MetasMatch[0], `const defaultMetasV2 = ${v1MetasStr};`);

fs.writeFileSync('src/data.ts', tsCode);
console.log("Swapped in src/data.ts");

// Update Supabase
async function updateDb() {
  const supabase = createClient("https://cnemtndccfppibecjuep.supabase.co", "sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj");
  
  const EMPRESA_ID = '00000000-0000-0000-0000-000000000001'; 
  const { data: config } = await supabase.from('empresa_configuracoes').select('*').eq('empresa_id', EMPRESA_ID).single();
  
  if (config && config.curva_desempenho) {
    let updated = false;
    for (let i=0; i < config.curva_desempenho.length; i++) {
        let c = config.curva_desempenho[i];
        if (c.nome && c.nome.includes('Misto')) {
           if (c.version === 'v1' || c.nome.includes('V1')) {
               // Assign old V2 data to V1
               c.curve = eval(v2CurveStr);
               c.metas = eval(`(${v2MetasStr})`);
               updated = true;
           }
           if (c.version === 'v2' || c.nome.includes('V2')) {
               // Assign old V1 data to V2
               c.curve = eval(v1CurveStr);
               c.metas = eval(`(${v1MetasStr})`);
               updated = true;
           }
        }
    }
    if (updated) {
       const { error } = await supabase.from('empresa_configuracoes').update({
          curva_desempenho: config.curva_desempenho
       }).eq('empresa_id', EMPRESA_ID);
       if (error) console.error(error);
       else console.log('Supabase swapped successfully!');
    }
  }
}

updateDb();
