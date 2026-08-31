const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://cnemtndccfppibecjuep.supabase.co', 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj');
supabase.from('empresa_configuracoes').select('programa_alimentar').eq('empresa_id', '00000000-0000-0000-0000-000000000001').single().then(r => console.log(JSON.stringify(r.data.programa_alimentar, null, 2)));
