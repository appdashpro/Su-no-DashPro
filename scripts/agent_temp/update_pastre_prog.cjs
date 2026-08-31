const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://cnemtndccfppibecjuep.supabase.co', 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj');

const newProg = [
  { nome: 'Alojamento', racao: 'Alojamento', dia_inicio: 1, dia_fim: 14 },
  { nome: 'Crescimento 1', racao: 'Crescimento 1', dia_inicio: 15, dia_fim: 32 },
  { nome: 'Crescimento 2', racao: 'Crescimento 2', dia_inicio: 33, dia_fim: 46 },
  { nome: 'Crescimento 3', racao: 'Crescimento 3', dia_inicio: 47, dia_fim: 64 },
  { nome: 'Terminação 1', racao: 'Terminação 1', dia_inicio: 65, dia_fim: 74 },
  { nome: 'Terminação 2', racao: 'Terminação 2', dia_inicio: 75, dia_fim: 96 }
];

supabase.from('empresa_configuracoes').update({ programa_alimentar: newProg }).eq('empresa_id', '00000000-0000-0000-0000-000000000001').then(r => console.log('Updated Pastre Program!'));
