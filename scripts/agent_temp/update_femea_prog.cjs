const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://cnemtndccfppibecjuep.supabase.co', 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj');

const progFemea = [
  { nome: 'Alojamento', racao: 'Alojamento', dia_inicio: 1, dia_fim: 14 },
  { nome: 'Crescimento 1', racao: 'Crescimento 1', dia_inicio: 15, dia_fim: 28 },
  { nome: 'Crescimento 2', racao: 'Crescimento 2', dia_inicio: 29, dia_fim: 42 },
  { nome: 'Crescimento 3', racao: 'Crescimento 3', dia_inicio: 43, dia_fim: 56 },
  { nome: 'Terminação 1', racao: 'Terminação 1', dia_inicio: 57, dia_fim: 66 },
  { nome: 'Terminação 2', racao: 'Terminação 2', dia_inicio: 67, dia_fim: 80 }
];

async function update() {
  const EMPRESA_ID = '00000000-0000-0000-0000-000000000001';
  const { data: config } = await supabase.from('empresa_configuracoes').select('*').eq('empresa_id', EMPRESA_ID).single();
  
  if (config && config.curva_desempenho) {
    let updated = false;
    for (let i = 0; i < config.curva_desempenho.length; i++) {
        const curveDef = config.curva_desempenho[i];
        if (curveDef.nome && curveDef.nome.includes('Curva V1') && curveDef.tipoLote === 'Fêmea') {
            config.curva_desempenho[i].programa_alimentar = progFemea;
            updated = true;
        }
    }
    
    if (updated) {
      await supabase.from('empresa_configuracoes').update({ curva_desempenho: config.curva_desempenho }).eq('empresa_id', EMPRESA_ID);
      console.log('Updated Fêmea prog!');
    }
  }
}
update();
