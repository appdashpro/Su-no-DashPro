const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://cnemtndccfppibecjuep.supabase.co', 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj');

const progMisto = [
  { nome: 'Alojamento', racao: 'Alojamento', dia_inicio: 1, dia_fim: 14 },
  { nome: 'Crescimento 1', racao: 'Crescimento 1', dia_inicio: 15, dia_fim: 32 },
  { nome: 'Crescimento 2', racao: 'Crescimento 2', dia_inicio: 33, dia_fim: 46 },
  { nome: 'Crescimento 3', racao: 'Crescimento 3', dia_inicio: 47, dia_fim: 64 },
  { nome: 'Terminação 1', racao: 'Terminação 1', dia_inicio: 65, dia_fim: 74 },
  { nome: 'Terminação 2', racao: 'Terminação 2', dia_inicio: 75, dia_fim: 96 }
];

async function update() {
  const EMPRESA_ID = '00000000-0000-0000-0000-000000000001';
  const { data: config } = await supabase.from('empresa_configuracoes').select('*').eq('empresa_id', EMPRESA_ID).single();
  
  if (config && config.curva_desempenho) {
    let updated = false;
    for (let i = 0; i < config.curva_desempenho.length; i++) {
        const curveDef = config.curva_desempenho[i];
        if (curveDef.nome && curveDef.nome.includes('Curva V1') && (curveDef.tipoLote === 'Misto' || curveDef.tipoLote === 'Macho')) {
            config.curva_desempenho[i].programa_alimentar = progMisto;
            updated = true;
        }
    }
    
    if (updated) {
      await supabase.from('empresa_configuracoes').update({ curva_desempenho: config.curva_desempenho }).eq('empresa_id', EMPRESA_ID);
      console.log('Updated Misto/Macho prog!');
    }
  }
}
update();
